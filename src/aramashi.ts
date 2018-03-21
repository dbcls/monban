import * as commander from "commander";
import { UriPatterns, UriPattern } from "./uri-patterns";
import { Counter } from "./aramashi-statistics";

export class Aramashi {
    linkPatterns: UriPatterns = new UriPatterns();
    commander: commander.Command = commander;
    constructor(argv: string[]) {
        this.commander
            .usage('[options] <file ...>')
            .option('--link-patterns <path>', 'path to link pattern definition')
            .parse(argv);
    }

    async run() {
        if (this.commander.args.length == 0) {
            this.commander.help();
        }

        if (this.commander.linkPatterns) {
            this.linkPatterns = await UriPatterns.loadTsv(this.commander.linkPatterns);
        }

        this.commander.args.forEach(async (fn) => {
            const counter = new Counter(this.linkPatterns);
            const r = await counter.statistics(fn)
            console.log(JSON.stringify(r, null, 2));
        });
    };
}
