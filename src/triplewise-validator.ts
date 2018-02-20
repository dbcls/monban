import { ValidationError } from "./validation-error";
import { Triple } from "./triple";

export class TriplewiseValidator {
    validate(triple: Triple): ValidationError[] {
        return [];
    }
    done(): ValidationError[] {
        return [];
    }
}