import * as fs from "fs";
import * as readline from "readline";

export class UriPattern {
    name: string;
    regexp: RegExp;

    constructor(name: string, pattern: string) {
        this.name = name;
        this.regexp = new RegExp(pattern);
    }

    match(str: string): boolean {
        return this.regexp.test(str);
    }
}

export class UriPatterns {
    entries: UriPattern[];
    constructor(entries: UriPattern[] = []) {
        this.entries = entries;
    }

    match(str: string): UriPattern | undefined {
        return this.entries.find((e) => e.match(str));
    }

    static loadTsv(fn: string): Promise<UriPatterns> {
        const s = fs.createReadStream(fn);
        const rl = readline.createInterface(s);
        const primalClasses = new Set();
        const uwl = new UriPatterns();

        rl.on('line', (l: string) => {
            if (l == "") {
                return;
            }
            const cols = l.split("\t", 2);
            uwl.entries.push(new UriPattern(cols[0], cols[1]));
        });
        return new Promise((resolve, reject) => {
            rl.on('close', () => resolve(uwl));
        });
    }
}