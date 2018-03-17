import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const subclassesOfFaldoPosition = new Set<string>([
  'http://biohackathon.org/resource/faldo#Position',
  'http://biohackathon.org/resource/faldo#StrandedPosition',
  'http://biohackathon.org/resource/faldo#ExactPosition',
  'http://biohackathon.org/resource/faldo#FuzzyPosition',
  'http://biohackathon.org/resource/faldo#InBetweenPosition',
  'http://biohackathon.org/resource/faldo#ReverseStrandPosition',
  'http://biohackathon.org/resource/faldo#BothStrandsPosition',
  'http://biohackathon.org/resource/faldo#ForwardStrandPosition',
  'http://biohackathon.org/resource/faldo#N-TerminalPosition',
  'http://biohackathon.org/resource/faldo#C-TerminalPosition',
  'http://biohackathon.org/resource/faldo#InRangePosition',
  'http://biohackathon.org/resource/faldo#OneOfPosition'
]);

const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const faldoReference = 'http://biohackathon.org/resource/faldo#reference';

export class Faldo extends TriplewiseValidator {
  faldoPositionInstances: Set<string> = new Set<string>();
  subjectsHavingfaldoReference: Set<string> = new Set<string>();

  validate(triple: Triple): ValidationError[] {
    if (triple.predicate === rdfType &&
      subclassesOfFaldoPosition.has(triple.object)) {
      this.faldoPositionInstances.add(triple.subject);
    }
    if (triple.predicate === faldoReference) {
      this.subjectsHavingfaldoReference.add(triple.subject);
    }
    return [];
  }

  done(): ValidationError[] {
    const errors: ValidationError[] = [];
    this.faldoPositionInstances.forEach(inst => {
      if (!this.subjectsHavingfaldoReference.has(inst)) {
        errors.push({ message: `${inst} is a faldo:Position, but faldo:reference is not found` });
      }
    })
    return errors;
  }
}