import * as N3 from "n3";

import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

N3.Util; // Workaround to load N3.Util

export class WithOntology extends TriplewiseValidator {
    triple(triple: Triple) {
        const ont = this.config.ontology;
        if (ont.isClass(triple.predicate)) {
            this.errorOnTriple(triple, `class ${triple.predicate} is used as a property`);
        }
        if (ont.isProprety(triple.object)) {
            this.errorOnTriple(triple, `property ${triple.object} is used as an object`)
        }
        if (ont.isDataProperty(triple.predicate)) {
            if (!N3.Util.isLiteral(triple.object)) {
                this.errorOnTriple(triple, `property ${triple.predicate} is a DataProperty, but the object ${triple.object} is not a literal`);
            }
        }
        if (ont.isObjectProperty(triple.predicate)) {
            if (!N3.Util.isIRI(triple.object)) {
                this.errorOnTriple(triple, `property ${triple.predicate} is an ObjectProperty, but the object ${triple.object} is not an IRI`);
            }
        }
    }
}