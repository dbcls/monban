import * as N3 from "n3";

import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

N3.Util; // Workaround to load N3.Util

export class WithOntology extends TriplewiseValidator {
    validate(triple: Triple): ValidationError[] {
        const errors = [];
        const ont = this.config.ontology;
        if (ont.isClass(triple.subject)) {
            errors.push({ message: `class ${triple.subject} is used as a subject` });
        }
        if (ont.isClass(triple.predicate)) {
            errors.push({ message: `class ${triple.predicate} is used as a property` });
        }
        if (ont.isProprety(triple.subject)) {
            errors.push({ message: `property ${triple.subject} is used as a subject` });
        }
        if (ont.isProprety(triple.object)) {
            errors.push({ message: `property ${triple.object} is used as an object` });
        }
        if (ont.isDataProperty(triple.predicate)) {
            if (!N3.Util.isLiteral(triple.object)) {
                errors.push({ message: `property ${triple.predicate} is a DataProperty, but the object ${triple.object} is not a literal` });
            }
        }
        if (ont.isObjectProperty(triple.predicate)) {
            if (!N3.Util.isIRI(triple.object)) {
                errors.push({ message: `property ${triple.predicate} is an ObjectProperty, but the object ${triple.object} is not an IRI` });
            }
        }
        return errors;
    }
}