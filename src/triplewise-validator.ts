import { Triple } from "./triple";
import { MonbanConfig } from "./monban-config";
import { ErrorLogger } from "./error-logger";
import { Error } from "./error";

export class TriplewiseValidator {
    config: MonbanConfig;
    errorLogger: ErrorLogger;
    pass: number;

    constructor(config: MonbanConfig, errorLogger: ErrorLogger) {
        this.config = config;
        this.errorLogger = errorLogger;
        this.pass = 0;
    }

    triple(triple: Triple, config: MonbanConfig) {
    }

    done() {
    }

    numPassesRequired(): number {
        return 1;
    }

    error(error: Error) {
        this.errorLogger.add(error);
    }
}