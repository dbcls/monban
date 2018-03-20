import { Triple } from "./triple";
import { Error } from "./error";

export class ErrorLogger {
    errors: Error[] = [];

    add(error: Error) {
        this.errors.push(error);
    }
}