import { Util as N3Util } from "n3";

import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorPropertyUsedAsObject, ErrorClassUsedAsProperty, ErrorNonLiteralObjectForDataproperty, ErrorNonIRIObjectForObjectProperty } from "../error";

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
            if (!N3Util.isLiteral(triple.object)) {
                this.error(new ErrorNonLiteralObjectForDataproperty(triple));
            }
        }
        if (ont.isObjectProperty(triple.predicate)) {
            if (!N3Util.isIRI(triple.object) && !N3Util.isBlank(triple.object)) {
                this.error(new ErrorNonIRIObjectForObjectProperty(triple));
            }
        }
    }
}