import * as commander from "commander";
import * as fs from "fs";
import * as readline from "readline";

import { Validator } from "./validator";
import { MonbanConfig } from "./monban-config";
import { UriPatterns } from "./uri-patterns";
import { Ontology } from "./ontology";
import { TripleReader } from "./triple-reader"

import { JsonReporter } from "./reporters/json-reporter";
import { MarkdownReporter } from "./reporters/markdown-reporter";

function collect(val: string, memo: string[]): string[] {
    memo.push(val);
    return memo;
}

const reporters: { [key: string]: any } = {
    'json': JsonReporter,
    'markdown': MarkdownReporter,
};

export class Monban {
    commander: commander.Command = commander;
    constructor(argv: string[]) {
        this.commander
            .usage('[options] <file ...>')
            .option('--primal-classes <path>', 'path to primal classes definition')
            .option('--uri-whitelist <path>', 'path to white list definition')
            .option('--uri-blacklist <path>', 'path to black list definition')
            .option('--ontology <path>', 'path to ontology', collect, [])
            .option('--output-format <format>', `output format ${Object.keys(reporters).join(', ')}`, 'markdown')
            .option('--report-limit <number>', 'number of error instances per error (negative for no limit)', 20)
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
        if (this.commander.reportLimit) {
            config.reportLimit = this.commander.reportLimit;
        }

        const reporter = reporters[this.commander.outputFormat];
        if (!reporter) {
            console.error(`builder ${this.commander.outputFormat} not supported`);
            return;
        }


        this.commander.args.forEach(async (fn) => {
            const reader = TripleReader.fromFile(fn);
            const validator = new Validator(reader, config);
            const r = await validator.validate();

            console.log(reporter.build(r, config));
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