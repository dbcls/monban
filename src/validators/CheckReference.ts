import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const dcReferences = 'http://purl.org/dc/terms/references';

const acceptableStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

export class CheckReference extends TriplewiseValidator {
  private filter(triple: Triple): Boolean {
    return triple.predicate === dcReferences;
  }
  validate(triple: Triple): ValidationError[] {
    if (!this.filter(triple)) {
      return [];
    }
    if (acceptableStems.some((stem) => triple.object.startsWith(stem))) {
      return [];
    }
    return [
      {
        message: `${triple.object} is not expected URI for dcterms:references`
      }
    ];
  }
}
