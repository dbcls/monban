import { Triple } from "./triple";
import { Error } from "./error";

export class ErrorLogger {
    errors: Map<string, Set<Error>> = new Map<string, Set<Error>>();

    add(error: Error) {
        const name = error.constructor.name;
        let errors = this.errors.get(name);
        if (!errors) {
            errors = new Set<Error>();
            this.errors.set(name, errors);
        }
        errors.add(error);
    }
}