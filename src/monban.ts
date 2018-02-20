import * as commander from "commander";
import {Validator} from "./validator";

export class Monban {
    validator = new Validator();

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

        this.commander.args.forEach(async (fn) => {
            const r = await this.validator.validate(fn);
            console.log(JSON.stringify(r, null, 2));
        });
    }
}