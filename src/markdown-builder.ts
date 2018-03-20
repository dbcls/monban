import { ValidationResults } from "./validation-results";

export class MarkdownBuilder {
    static build(results: ValidationResults): string {
        let buf = "";

        buf += "# monban results\n\n";

        const errors: any[] = [];
        results.errors.forEach((errs, type) => {
            buf += `## ${type}\n\n`;
            errs.forEach(err => {
                buf += `* ${err.message()}\n`;
            })
            buf += "\n"
        });

        return buf;
    }
}