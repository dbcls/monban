import * as fs from "fs";
import * as N3 from "n3";
import * as zlib from "zlib";
import { Readable, Writable } from "stream";

class Consumer extends Writable {
  errors: any[];
  nthTriple = 0;
  validators: any[];

  constructor(validators) {
    super({objectMode: true});
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
  validators: any[];

  constructor(validators) {
    this.validators = validators;
  }

  validate(path) {
    const streamParser = N3.StreamParser();
    const inputStream = fs.createReadStream(path);
    const t0 = new Date();

    let rdfStream: Readable;
    rdfStream = inputStream;
    if (path.endsWith('.gz')) {
      rdfStream = rdfStream.pipe(zlib.createGunzip());
    }

    rdfStream.pipe(streamParser);
    const consumer = new Consumer(this.validators);
    streamParser.pipe(consumer);

    return new Promise((resolve, reject) => {
      streamParser.on('end', () => {
        const elapsed = (new Date()).getMilliseconds() - t0.getMilliseconds();
        const numTriples = consumer.nthTriple;
        const triplesPerSecond = numTriples / elapsed * 1000;
        const statistics = {
          elapsed,
          numTriples,
          triplesPerSecond,
        };
        resolve({path, statistics, errors: consumer.errors});
      });
    });
  }
}

module.exports = Validator;
