import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorObjectOfDctermsReferences, ErrorPredicateForReferences } from "../error";

const dcReferences = 'http://purl.org/dc/terms/references';

const referenceStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

export class Reference extends TriplewiseValidator {
  triple(triple: Triple) {
    if (triple.predicate === dcReferences && !this.isReference(triple.object)) {
      this.error(new ErrorObjectOfDctermsReferences(triple))
    }
    if (this.isReference(triple.object) && triple.predicate !== dcReferences) {
      this.error(new ErrorPredicateForReferences(triple))
    }
  }

  isReference(o: string): boolean {
    return referenceStems.some((stem) => o.startsWith(stem));
  }
}
