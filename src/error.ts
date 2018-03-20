import { Triple } from "./triple";

export abstract class Error {
    message(): string { return "" };
}

class ErrorOnTriple extends Error {
    triple: Triple;
    constructor(triple: Triple) {
        super();
        this.triple = triple;
    }

    toJSON() {
        return {
            triple: this.triple,
            message: this.message()
        };
    }
}

class ErrorOnNode extends Error {
    node: string;
    constructor(node: string) {
        super();
        this.node = node;
    }

    toJSON() {
        return {
            node: this.node,
            message: this.message()
        };
    }
}

class ErrorOnSubjectOfTriple extends ErrorOnTriple {
    message(): string {
        return `subject "${this.triple.subject}"`
    }
}

class ErrorOnPredicateOfTriple extends ErrorOnTriple {
    message(): string {
        return `predicate "${this.triple.predicate}"`
    }
}

class ErrorOnObjectOfTriple extends ErrorOnTriple {
    message(): string {
        return `object "${this.triple.object}"`
    }
}

export class ErrorObjectOfDctermsReferences extends ErrorOnObjectOfTriple {
    message() {
        return `not expected URI for dcterms:references`;
    }
}

export class ErrorPredicateForReferences extends ErrorOnPredicateOfTriple {
    message() {
        return `dcterms:references is not used for reference ${this.triple.object} (used ${this.triple.predicate})`;
    }
}

export class ErrorNoSuitableSeeAlsoFor extends ErrorOnNode {
    uris: string[];
    constructor(node: string, uris: string[]) {
        super(node);
        this.uris = uris;
    }
    message() {
        return `no suitable seeAlso objects found for subject ${this.node}; found ${this.uris.join(', ')}`;
    }
}

export class ErrorFaldoPositionReferenceNotFound extends ErrorOnNode {
    message() {
        return `${this.node} is a faldo:Position, but faldo:reference is not found`;
    }
}

export class ErrorDepictsDepictionNotFound extends ErrorOnNode {
    message() {
        return `${this.node} is image-ish but neigher foaf:depicts nor foaf:depiction is found for this`;
    }
}

export class ErrorDepictsForNotImageishSubject extends ErrorOnSubjectOfTriple {
    message() {
        return `subject ${this.triple.subject} of foaf:depicts is not image-ish`;
    }
}

export class ErrorDepictionForNotImageshObject extends ErrorOnObjectOfTriple {
    message() {
        return `object ${this.triple.object} is image-ish buf predicate is not foaf:depiction`;
    }
}

export class ErrorLangtagMismatch extends ErrorOnNode {
    guess: string;
    actual: string;

    constructor(node: string, guess: string, actual: string) {
        super(node);
        this.guess = guess;
        this.actual = actual;
    }

    message() {
        return `${this.node} looks like @${this.guess}, but @${this.actual} specified`;
    }
}

export class ErrorLiteralFormat extends ErrorOnNode {
    type: string;

    constructor(node: string, type: string) {
        super(node);
        this.type = type;
    }
    message() {
        return `illegal value '${this.node}' for ${this.type}`;
    }
}

export class ErrorRdfsLabelNotFoundForProperty extends ErrorOnNode {
    message() {
        return `${this.node} is a property, but rdfs:label is not found for it`;
    }
}

export class ErrorRdfsDomainNotFoundForProperty extends ErrorOnNode {
    message() {
        return `${this.node} is a property, but rdfs:domain is not found for it`;
    }
}

export class ErrorRdfsRangeNotFoundForProperty extends ErrorOnNode {
    message() {
        return `${this.node} is a property, but rdfs:range is not found for it`;
    }
}

export class ErrorRdfsLabelNotFoundForClass extends ErrorOnNode {
    message() {
        return `${this.node} is a class, but rdfs:label is not found for it`;
    }
}

export class ErrorRdfsLabelNotFoundForInstanceOfPrimaryClass extends ErrorOnNode {
    message() {
        return `${this.node} is an instance of the primal class but rdfs:label is not found for this`;
    }
}

export class ErrorDctermsIdentifierNotFoundForInstanceOfPrimaryClass extends ErrorOnNode {
    message() {
        return `${this.node} is an instance of the primal class but dcterms:identifier is not found for this`;
    }
}

export class ErrorClassUsedAsProperty extends ErrorOnTriple {
    message() {
        return `class ${this.triple.predicate} is used as a property`;
    }
}

export class ErrorPropertyUsedAsObject extends ErrorOnTriple {
    message() {
        return `property ${this.triple.object} is used as a property`;
    }
}

export class ErrorNonLiteralObjectForDataproperty extends ErrorOnTriple {
    message() {
        return `property ${this.triple.predicate} is a DataProperty, but the object ${this.triple.object} is not a literal`;
    }
}

export class ErrorNonIRIObjectForObjectProperty extends ErrorOnTriple {
    message() {
        return `property ${this.triple.predicate} is an ObjectProperty, but the object ${this.triple.object} is not an IRI`;
    }
}

export class ErrorSio000300NotFound extends ErrorOnNode {
    message() {
        return `${this.node} has no sio:SIO_000300 predicates`;
    }
}

export class ErrorSio000221NotFound extends ErrorOnNode {
    message() {
        return `${this.node} has no sio:SIO_000221 predicates`;
    }
}

export class ErrorSio000216NotFound extends ErrorOnNode {
    message() {
        return `${this.node} has no sio:SIO_000216 predicates`;
    }
}

export class ErrorValueIsNotNumeric extends ErrorOnObjectOfTriple {
    message() {
        return `${this.triple.object} is not numeric`
    }
}

export class ErrorObjectIsNotUOClass extends ErrorOnObjectOfTriple {
    message() {
        return `${this.triple.object} is not a class of Unit of Measurement Ontology`
    }
}