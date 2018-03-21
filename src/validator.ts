import { Writable } from "stream";

import { TriplewiseValidator } from "./triplewise-validator";
import { Triple } from "./triple";
import { MonbanConfig } from "./monban-config";
import { ErrorLogger } from "./error-logger";
import { ValidationResults, Statistics } from "./validation-results";
import { TripleReader } from "./triple-reader";

import { Reference } from "./validators/reference";
import { FoafImage } from "./validators/foaf-image";
import { Literal } from "./validators/literal";
import { PrimalClass } from "./validators/primal-class";
import { SeeAlso } from "./validators/see-also";
import { WithOntology } from "./validators/with-ontology";
import { ValueWithUnit } from "./validators/value-with-unit";
import { Faldo } from "./validators/faldo";
import { Ontology } from "./validators/ontology";
import { Langtag } from "./validators/langtag";

const SUB_VALIDATORS = [
  Reference,
  FoafImage,
  Literal,
  PrimalClass,
  SeeAlso,
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
  reader: TripleReader;
  config: MonbanConfig;
  errorLogger: ErrorLogger = new ErrorLogger();

  constructor(reader: TripleReader, config: MonbanConfig) {
    this.reader = reader;
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

    return { statistics, errors: this.errorLogger.errors, path: this.reader.path };
  }

  process(pass: number, subValidators: TriplewiseValidator[]): Promise<void> {
    subValidators.forEach(v => v.pass = pass);
    const consumer = new Consumer(pass, subValidators, this.config);
    const stream = this.reader.stream();
    stream.pipe(consumer);

    return new Promise((resolve, reject) => {
      stream.on('end', () => {
        subValidators.forEach(v => v.done());
        resolve();
      });
    });
  }
}