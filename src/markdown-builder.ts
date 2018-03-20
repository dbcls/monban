import { ValidationResults } from "./validation-results";

export class MarkdownBuilder {
    static build(results: ValidationResults): string {
        let buf = "";

        buf += "# monban results\n\n";

        if (results.errors.size === 0) {
            buf += "no errors found";
            return buf;
        }

        results.errors.forEach((errs, type) => {
            buf += `## ${type}\n\n`;
            errs.forEach(err => {
                if (err.triple) {
                    buf += `* ${err.message()} ${JSON.stringify(err.triple)}\n`;
                } else {
                    buf += `* ${err.message()}\n`;
                }
            })
            buf += "\n"
        });

        return buf;
    }
}