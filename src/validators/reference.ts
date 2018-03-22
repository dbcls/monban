import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorObjectOfDctermsReferences, ErrorPredicateForReferences } from "../error";

const dcReferences = 'http://purl.org/dc/terms/references';

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
    return !!this.config.bibPatterns.match(o);
  }
}
