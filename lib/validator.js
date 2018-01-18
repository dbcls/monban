const fs = require('fs');
const N3 = require('n3');
const zlib = require('zlib');
const Writable = require('stream').Writable;

class Consumer extends Writable {
  constructor(validators) {
    super({objectMode: true});
    this.errors = [];
    this.nthTriple = 0;
    this.validators = validators;
  }

  _write(triple, encoding, done) {
    const errors = [];
    this.validators.forEach((validator) => {
      const e = validator.validate(triple);
      if (e) {
        Array.prototype.push.apply(errors, e);
      }
    });
    if (errors.length > 0) {
      this.errors.push({nthTriple: this.nthTriple, triple, errors});
    }
    this.nthTriple++;
    done();
  }
}

class Validator {
  constructor(validators) {
    this.validators = validators;
  }

  validate(path) {
    const streamParser = N3.StreamParser();
    const inputStream = fs.createReadStream(path);
    let rdfStream = inputStream;
    if (path.endsWith('.gz')) {
      rdfStream = rdfStream.pipe(zlib.createGunzip());
    }

    rdfStream.pipe(streamParser);
    const consumer = new Consumer(this.validators);
    streamParser.pipe(consumer);

    return new Promise((resolve, reject) => {
      streamParser.on('end', () => {
        resolve({path, errors: consumer.errors});
      });
    });
  }
}

module.exports = Validator;
