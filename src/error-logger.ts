import { Triple } from "./triple";
import { Error } from "./error";

interface Errors {
    cause: Triple | string | undefined
    errors: string[]
}

export class ErrorLogger {
    errors: Error[] = [];

    add(error: Error) {
        this.errors.push(error);
    }
}