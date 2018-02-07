import { ValidationError } from "./ValidationError";
import { Triple } from "./Triple";

export class TriplewiseValidator {
    validate(triple: Triple): ValidationError[] {
        return [];
    }
    done(): ValidationError[] {
        return [];
    }
}