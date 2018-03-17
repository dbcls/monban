import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

export class ValueWithUnit extends TriplewiseValidator {
    validate(triple: Triple): ValidationError[] {
        // FIXME WIP
        return [];
    }

    hasOboPrefix(n: string): boolean {
        return n.startsWith('http://purl.obolibrary.org/obo/');
    }
}