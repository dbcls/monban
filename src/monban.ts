import * as commander from "commander";
import * as fs from "fs";
import * as readline from "readline";

import { Validator } from "./validator";
import { MonbanConfig } from "./monban-config";
import { UriPatterns } from "./uri-patterns";
import { Ontology } from "./ontology";

export class Monban {
    validator = new Validator();

    commander: commander.Command = commander;
    constructor(argv: string[]) {
        this.commander
            .usage('[options] <file ...>')
            .option('--primal-classes <path>', 'path to primal classes definition')
            .option('--uri-whitelist <path>', 'path to white list definition')
            .option('--uri-blacklist <path>', 'path to black list definition')
            .option('--ontology <path>', 'path to ontology')
            .parse(argv);
    }

    async run() {
        if (this.commander.args.length == 0) {
            this.commander.help();
        }

        const config = new MonbanConfig();
        if (this.commander.primalClasses) {
            config.primalClasses = await this.loadPrimalClasses();
        }
        if (this.commander.uriWhitelist) {
            config.uriWhitelist = await UriPatterns.loadTsv(this.commander.uriWhitelist);
        }
        if (this.commander.uriBlacklist) {
            config.uriBlacklist = await UriPatterns.loadTsv(this.commander.uriBlacklist);
        }
        if (this.commander.ontology) {
            config.ontology = await Ontology.load(this.commander.ontology);
        }

        this.commander.args.forEach(async (fn) => {
            const r = await this.validator.validate(fn, config);
            console.log(JSON.stringify(r, null, 2));
        });
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
}