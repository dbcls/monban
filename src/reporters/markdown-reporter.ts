import * as N3 from "n3";

import { ValidationResults } from "../validation-results";
import { Triple } from "../triple";

const N3Writer = <any>N3.Writer();

export class MarkdownReporter {
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
                const triple = err.triple;
                if (triple) {
                    const nt = N3Writer.tripleToString(triple.subject, triple.predicate, triple.object, triple.graph).trim();
                    buf += `* ${err.message()} \`${nt}\`\n`;
                } else {
                    buf += `* ${err.message()}\n`;
                }
            })
            buf += "\n"
        });

        return buf;
    }
}