import * as fs from "fs";
import * as readline from "readline";

export class UriWhitelistEntry {
    name: string;
    regexp: RegExp;

    constructor(name: string, pattern: string) {
        this.name = name;
        this.regexp = new RegExp(pattern);
    }

    match(str: string): boolean {
        return !!str.match(this.regexp);
    }
}

export class UriWhitelist {
    entries: UriWhitelistEntry[];
    constructor() {
        this.entries = [];
    }

    match(str: string): UriWhitelistEntry | undefined {
        return this.entries.find((e) => e.match(str));
    }

    static loadTsv(fn: string): Promise<UriWhitelist> {
        const s = fs.createReadStream(fn);
        const rl = readline.createInterface(s);
        const primalClasses = new Set();
        const uwl = new UriWhitelist();//FIXME

        rl.on('line', (l: string) => {
            if (l == "") {
                return;
            }
            const cols = l.split("\t", 2);
            uwl.entries.push(new UriWhitelistEntry(cols[0], cols[1]));
        });
        return new Promise((resolve, reject) => {
            rl.on('close', () => resolve(uwl));
        });
    }
}