import * as fs from "fs";
import * as N3 from "n3";
import * as zlib from "zlib";
import { Readable, Writable, Transform } from "stream";

import { CheckReferenceValidator } from "./validators/check-reference-validator";

const SUB_VALIDATORS = [
  new CheckReferenceValidator(),
];

export class ValidationError {
  message: string;
}

export interface Triple {
  subject: string;
  predicate: string;
  object: string;
  graph: string;
}

class ValidationErrorsGroupedByTriple {
  nthTriple: number;
  triple: Triple;
  errors: ValidationError[];
}

export interface TriplewiseValidator {
  filter(triple: Triple): Boolean;
  validate(triple: Triple): ValidationError[];
}

class Consumer extends Writable {
  errors: ValidationErrorsGroupedByTriple[] = [];
  nthTriple = 0;
  subValidators: TriplewiseValidator[];

  constructor() {
    super({objectMode: true});
    this.subValidators = SUB_VALIDATORS;
  }

  _write(triple, encoding, done) {
    const errorsOnTriple: ValidationError[] = [];
    this.subValidators.forEach((validator) => {
      if (validator.filter(triple)) {
        const e = validator.validate(triple);
        if (e) {
          Array.prototype.push.apply(errorsOnTriple, e);
        }
      }
    });
    if (errorsOnTriple.length > 0) {
      this.errors.push({nthTriple: this.nthTriple, triple, errors: errorsOnTriple});
    }
    this.nthTriple++;
    done();
  }
}

class TripleFilter extends Transform {
  s?: string;
  p?: string;
  o?: string;

  constructor(s?: string, p?: string, o?: string) {
    super({objectMode: true});
    this.s = s;
    this.p = p;
    this.o = o;
  }

  _transform(triple, enc, done) {
    if (
      (!this.s || triple.subject === this.s) &&
      (!this.p || triple.predicate === this.p) &&
      (!this.o || triple.object === this.o)
    ) {
      this.push(triple);
    }
    done();
  }
}

function tripleStream(path): Readable {
  const streamParser = N3.StreamParser();
  const inputStream = fs.createReadStream(path);
  let rdfStream: Readable;
  rdfStream = inputStream;

  if (path.endsWith('.gz')) {
    rdfStream = rdfStream.pipe(zlib.createGunzip());
  }
  return rdfStream.pipe(streamParser);
}

class Validator {
  validate(path) {
    const consumer = new Consumer();
    const stream = tripleStream(path);
    stream.pipe(consumer);

    const t0 = new Date();
    return new Promise((resolve, reject) => {
      stream.on('end', () => {
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
