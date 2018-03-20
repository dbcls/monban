import { Triple } from "./triple";

interface Errors {
    cause: Triple | string | undefined
    errors: string[]
}

export class ErrorLogger {
    errorsOnTriples: Map<Triple, Set<string>> = new Map<Triple, Set<string>>();
    errorsOnNodes: Map<string, Set<string>> = new Map<string, Set<string>>();

    addErrorOnTriple(triple: Triple, message: string) {
        let errors = this.errorsOnTriples.get(triple);
        if (!errors) {
            errors = new Set<string>();
            this.errorsOnTriples.set(triple, errors);
        }
        errors.add(message);
    }

    addErrorOnNode(node: string, message: string) {
        let errors = this.errorsOnNodes.get(node);
        if (!errors) {
            errors = new Set<string>();
            this.errorsOnNodes.set(node, errors);
        }
        errors.add(message);
    }

    errors(): Errors[] {
        const errors: Errors[] = [];
        this.errorsOnTriples.forEach((errs, triple) => {
            errors.push({
                cause: triple,
                errors: Array.from(errs),
            });
        });
        this.errorsOnNodes.forEach((errs, node) => {
            errors.push({
                cause: node,
                errors: Array.from(errs),
            });
        });
        return errors;
    }
}