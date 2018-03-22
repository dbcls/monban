import * as N3 from "n3";
import * as shellescape from "shell-escape";

import { ValidationResults } from "../validation-results";
import { Error } from "../error";
import { Triple } from "../triple";
import { MonbanConfig } from "../monban-config";

const N3Writer = <any>N3.Writer();

function truncateErrors(errors: Set<Error>, limit: number): Set<Error> {
    if (limit < 0) {
        return errors;
    }
    const truncated = new Set<Error>();
    for (let error of errors.keys()) {
        if (truncated.size >= limit) {
            break;
        }
        truncated.add(error);
    }
    return truncated;
}

export class MarkdownReporter {
    static build(results: ValidationResults, config: MonbanConfig): string {
        let buf = "";

        buf += "# monban results\n\n";
        buf += shellescape(process.argv) + "\n\n";

        buf += `* source: ${results.path}\n`;
        buf += `* elapsed: ${results.statistics.elapsed} ms\n`;
        buf += "\n";

        if (results.errors.size === 0) {
            buf += "no errors found";
            return buf;
        }

        results.errors.forEach((errors, type) => {
            buf += `## ${type} (${errors.size})\n\n`;
            const truncated = truncateErrors(errors, config.reportLimit);
            const numTruncated = errors.size - truncated.size;
            truncated.forEach(err => {
                const triple = err.triple;
                if (triple) {
                    const nt = N3Writer.tripleToString(triple.subject, triple.predicate, triple.object, triple.graph).trim();
                    const nth = triple.nth ? ` nth=${triple.nth}` : "";
                    buf += `* ${err.message()} (context: \`${nt}\`${nth})\n`;
                } else {
                    buf += `* ${err.message()}\n`;
                }
            })
            if (numTruncated > 0) {
                buf += `\n... and ${numTruncated} more\n`;
            }
            buf += "\n"
        });

        return buf;
    }
}