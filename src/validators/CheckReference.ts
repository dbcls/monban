import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const dcReferences = 'http://purl.org/dc/terms/references';

const referenceStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

export class CheckReference extends TriplewiseValidator {
  triple(triple: Triple) {
    if (triple.predicate === dcReferences && !this.isReference(triple.object)) {
      this.errorOnTriple(triple, `${triple.object} is not expected URI for dcterms:references`);
    }
    if (this.isReference(triple.object) && triple.predicate !== dcReferences) {
      this.errorOnTriple(triple, `${triple.object} is a reference, but dcterms:references is not used (used ${triple.predicate})`);
    }
    return [];
  }

  isReference(o: string): boolean {
    return referenceStems.some((stem) => o.startsWith(stem));
  }
}
