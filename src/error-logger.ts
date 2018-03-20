import { Triple } from "./triple";
import { Error } from "./error";

export class ErrorLogger {
    errorsGroupByTypes: Map<String, Set<Error>> = new Map<String, Set<Error>>();

    add(error: Error) {
        const name = error.constructor.name;
        let errors = this.errorsGroupByTypes.get(name);
        if (!errors) {
            errors = new Set<Error>();
            this.errorsGroupByTypes.set(name, errors);
        }
        errors.add(error);
    }

    errors(): any[] {
        const errors: any[] = [];
        this.errorsGroupByTypes.forEach((errs, type) => {
            errors.push({
                type: type,
                errors: Array.from(errs),
            });
        });
        return errors;
    }
}