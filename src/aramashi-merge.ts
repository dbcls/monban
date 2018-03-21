import * as commander from "commander";
import { Statistics } from "./aramashi-statistics";

export class AramashiMerge {
    commander: commander.Command = commander;
    constructor(argv: string[]) {
        this.commander
            .usage('[options] <file ...>')
            .parse(argv);
    }

    async run() {
        if (this.commander.args.length == 0) {
            this.commander.help();
        }

        const s = new Statistics();
        await Promise.all(this.commander.args.map(async (fn) => {
            const r = await Statistics.loadFromFile(fn);
            s.merge(r);
        }));
        console.log(JSON.stringify(s, null, 2));
    };
}
