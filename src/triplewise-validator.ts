import { ValidationError } from "./validation-error";
import { Triple } from "./triple";
import { MonbanConfig } from "./monban-config";

export class TriplewiseValidator {
    config: MonbanConfig;
    constructor(config: MonbanConfig) {
        this.config = config;
    }
    validate(triple: Triple, config: MonbanConfig): ValidationError[] {
        return [];
    }
    done(): ValidationError[] {
        return [];
    }
}