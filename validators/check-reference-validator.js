const dcReferences = 'http://purl.org/dc/terms/references';

const acceptableStems = [
  'http://identifiers.org/pubmed/',
  'http://identifiers.org/pmc/',
  'http://doi.org/',
];

class CheckReferenceValidator {
  validate(triple) {
    if (triple.predicate !== dcReferences) {
      return;
    }
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

module.exports = CheckReferenceValidator;
