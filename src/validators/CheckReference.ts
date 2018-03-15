import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const dcReferences = 'http://purl.org/dc/terms/references';

const referenceStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

export class CheckReference extends TriplewiseValidator {
  validate(triple: Triple): ValidationError[] {
    const errors = [];
    if (triple.predicate === dcReferences && !this.isReference(triple.object)) {
      errors.push(
        {
          message: `${triple.object} is not expected URI for dcterms:references`
        }
      );
    }
    if (this.isReference(triple.object) && triple.predicate !== dcReferences) {
      errors.push(
        {
          message: `${triple.object} is not expected URI for dcterms:references`
        }
      );
    }
    return errors;
  }
  isReference(o: string): boolean {
    return referenceStems.some((stem) => o.startsWith(stem));
  }
}