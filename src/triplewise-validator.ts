import { Triple } from "./triple";
import { MonbanConfig } from "./monban-config";
import { ErrorLogger } from "./error-logger";

export class TriplewiseValidator {
    config: MonbanConfig;
    errorLogger: ErrorLogger;

    constructor(config: MonbanConfig, errorLogger: ErrorLogger) {
        this.config = config;
        this.errorLogger = errorLogger;
    }

    validate(triple: Triple, config: MonbanConfig) {
    }

    done() {
    }

    errorOnTriple(triple: Triple, message: string) {
        this.errorLogger.addErrorOnTriple(triple, message);
    }

    errorOnNode(node: string, message: string) {
        this.errorLogger.addErrorOnNode(node, message);
    }
}