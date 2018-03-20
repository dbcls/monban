import * as N3 from "n3";

import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorPropertyUsedAsObject, ErrorClassUsedAsProperty, ErrorNonLiteralObjectForDataproperty, ErrorNonIRIObjectForObjectProperty } from "../error";

N3.Util; // Workaround to load N3.Util

export class WithOntology extends TriplewiseValidator {
    triple(triple: Triple) {
        const ont = this.config.ontology;
        if (ont.isClass(triple.predicate)) {
            this.error(new ErrorClassUsedAsProperty(triple));
        }
        if (ont.isProprety(triple.object)) {
            this.error(new ErrorPropertyUsedAsObject(triple));
        }
        if (ont.isDataProperty(triple.predicate)) {
            if (!N3.Util.isLiteral(triple.object)) {
                this.error(new ErrorNonLiteralObjectForDataproperty(triple));
            }
        }
        if (ont.isObjectProperty(triple.predicate)) {
            if (!N3.Util.isIRI(triple.object)) {
                this.error(new ErrorNonIRIObjectForObjectProperty(triple));
            }
        }
    }
}