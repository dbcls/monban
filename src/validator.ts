import { Writable } from "stream";

import { TriplewiseValidator } from "./triplewise-validator";
import { Triple } from "./triple";
import { MonbanConfig } from "./monban-config";
import { ErrorLogger } from "./error-logger";
import { ValidationResults, Statistics } from "./validation-results";

import { CheckReference } from "./validators/CheckReference";
import { FoafImage } from "./validators/FoafImage";
import { Literal } from "./validators/Literal";
import { PrimalClass } from "./validators/PrimalClass";
import { CheckSeeAlso } from "./validators/CheckSeeAlso";
import { WithOntology } from "./validators/WithOntology";
import { ValueWithUnit } from "./validators/ValueWithUnit";
import { Faldo } from "./validators/Faldo";
import { Ontology } from "./validators/Ontology";
import { Langtag } from "./validators/Langtag";
import { TripleStream } from "./triple-stream";

const SUB_VALIDATORS = [
  CheckReference,
  FoafImage,
  Literal,
  PrimalClass,
  CheckSeeAlso,
  WithOntology,
  ValueWithUnit,
  Faldo,
  Ontology,
  Langtag,
];

class Consumer extends Writable {
  nthTriple = 0;
  subValidators: TriplewiseValidator[];
  config: MonbanConfig = new MonbanConfig();

  constructor(pass: number, subValidators: TriplewiseValidator[], config: MonbanConfig) {
    super({ objectMode: true });
    this.subValidators = subValidators;
    this.config = config;
  }

  _write(triple: Triple, encoding: string, done: () => void) {
    triple.nth = this.nthTriple;
    this.subValidators.forEach((validator) => {
      validator.triple(triple, this.config);
    });
    this.nthTriple++;
    done();
  }
}

export class Validator {
  path: string;
  config: MonbanConfig;
  errorLogger: ErrorLogger = new ErrorLogger();

  constructor(path: string, config: MonbanConfig) {
    this.path = path;
    this.config = config;
  }

  async validate(): Promise<ValidationResults> {
    const t0 = new Date();

    const subValidators = SUB_VALIDATORS.map((cl) => new cl(this.config, this.errorLogger));
    const numPassesRequired = Math.max(...subValidators.map(v => v.numPassesRequired()));
    for (let i = 0; i < numPassesRequired; i++) {
      const vs = subValidators.filter(v => v.numPassesRequired() > i);
      await this.process(i, vs);
    }

    const statistics = new Statistics();
    statistics.elapsed = new Date().getTime() - t0.getTime();

    return { statistics, errors: this.errorLogger.errors, path: this.path };
  }

  process(pass: number, subValidators: TriplewiseValidator[]): Promise<void> {
    subValidators.forEach(v => v.pass = pass);
    const consumer = new Consumer(pass, subValidators, this.config);
    const stream = TripleStream.fromFile(this.path);
    stream.pipe(consumer);

    return new Promise((resolve, reject) => {
      stream.on('end', () => {
        subValidators.forEach(v => v.done());
        resolve();
      });
    });
  }
}