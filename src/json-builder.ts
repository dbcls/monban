import { ValidationResults } from "./validation-results";

export class JsonBuilder {
    static build(results: ValidationResults): string {

        const errors: any[] = [];
        results.errors.forEach((errs, type) => {
            errors.push({
                type: type,
                errors: Array.from(errs),
            });
        });

        return JSON.stringify(Object.assign(results, { errors }), null, 2);
    }
}