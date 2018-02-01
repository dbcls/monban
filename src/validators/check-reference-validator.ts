import {TriplewiseValidator, Triple, ValidationError}  from "../validator";

const dcReferences = 'http://purl.org/dc/terms/references';

const acceptableStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

export class CheckReferenceValidator implements TriplewiseValidator {
  filter(triple: Triple): Boolean {
    return triple.predicate === dcReferences;
  }
  validate(triple: Triple): ValidationError[] {
    if (acceptableStems.some((stem) => triple.object.startsWith(stem))) {
      return;
    }
    return [
      {
        message: `${triple.object} is not expected URI for dcterms:references`
      }
    ];
  }
}
