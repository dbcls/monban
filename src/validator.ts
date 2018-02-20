import * as fs from "fs";
import * as N3 from "n3";
import * as zlib from "zlib";
import { Readable, Writable, Transform } from "stream";

import { N3StreamParser } from "n3";
import { TriplewiseValidator } from "./triplewise-validator";
import { Triple } from "./triple";
import { ValidationError } from "./validation-error";

import { CheckReference } from "./validators/CheckReference";
import { FoafImage } from "./validators/FoafImage";
import { Literal } from "./validators/Literal";

const SUB_VALIDATORS = [
  CheckReference,
  FoafImage,
  Literal
];

class ValidationErrorsGroupedByTriple {
  nthTriple: number = 0;
  triple: Triple | undefined;
  errors: ValidationError[] = [];
}

class Consumer extends Writable {
  errors: ValidationErrorsGroupedByTriple[] = [];
  nthTriple = 0;
  subValidators: TriplewiseValidator[];

  constructor(subValidators: TriplewiseValidator[]) {
    super({ objectMode: true });
    this.subValidators = subValidators;
  }

  _write(triple: Triple, encoding: string, done: () => void) {
    const errorsOnTriple: ValidationError[] = [];
    this.subValidators.forEach((validator) => {
      const e = validator.validate(triple);
      if (e) {
        Array.prototype.push.apply(errorsOnTriple, e);
      }
    });
    if (errorsOnTriple.length > 0) {
      this.errors.push({ nthTriple: this.nthTriple, triple, errors: errorsOnTriple });
    }
    this.nthTriple++;
    done();
  }
}

function tripleStream(path: string): N3StreamParser {
  const streamParser = N3.StreamParser();
  const inputStream = fs.createReadStream(path);
  let rdfStream: Readable;
  rdfStream = inputStream;

  if (path.endsWith('.gz')) {
    rdfStream = rdfStream.pipe(zlib.createGunzip());
  }
  return rdfStream.pipe(streamParser);
}

class Statistics {
  elapsed: number = 0;
  numTriples: number = 0;
  triplesPerSecond: number = 0;
}

class ValidationResults {
  path = "";
  statistics: Statistics = new Statistics();
  errors: ValidationErrorsGroupedByTriple[] = [];
}

export class Validator {
  validate(path: string): Promise<ValidationResults> {
    const subValidators = SUB_VALIDATORS.map((cl) => new cl());
    const consumer = new Consumer(subValidators);
    const stream = tripleStream(path);
    stream.pipe(consumer);

    const t0 = new Date();
    return new Promise<ValidationResults>((resolve: (value: ValidationResults) => void, reject) => {
      stream.on('end', () => {
        const errors: ValidationErrorsGroupedByTriple[] = [];
        subValidators.forEach((v) => {
          const e = v.done();
          Array.prototype.push.apply(errors, e);
        });

        const statistics = new Statistics();
        statistics.elapsed = new Date().getTime() - t0.getTime();
        statistics.numTriples = consumer.nthTriple;
        statistics.triplesPerSecond = statistics.numTriples / statistics.elapsed * 1000;

        // TODO fix consumer.error to be compatible with ValidationErrorsGroupedByTriple
        Array.prototype.push.apply(errors, consumer.errors);
        resolve({ path, statistics, errors });
      });
    });
  }
}
