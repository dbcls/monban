import * as commander from "commander";
import * as fs from "fs";
import * as readline from "readline";

import { Validator } from "./validator";
import { MonbanConfig } from "./monban-config";

export class Monban {
    validator = new Validator();

    commander: commander.Command = commander;
    constructor(argv: string[]) {
        this.commander
            .usage('[options] <file ...>')
            .option('--primal-classes <path>', 'path to primal classes definition')
            .parse(argv);
    }

    loadPrimalClasses(): Promise<Set<string>> {
        const s = fs.createReadStream(this.commander.primalClasses);
        const rl = readline.createInterface(s);
        const primalClasses = new Set();
        rl.on('line', (l) => {
            if (l == "") {
                return;
            }
            primalClasses.add(l);
        });
        return new Promise((resolve, reject) => {
            rl.on('close', () => resolve(primalClasses));
        });
    }

    async run() {
        if (this.commander.args.length == 0) {
            this.commander.help();
        }

        const config = new MonbanConfig();
        if (this.commander.primalClasses) {
            config.PrimalClasses = await this.loadPrimalClasses();
        }

        this.commander.args.forEach(async (fn) => {
            const r = await this.validator.validate(fn, config);
            console.log(JSON.stringify(r, null, 2));
        });
    }
}