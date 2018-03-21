import * as fs from "fs";
import * as zlib from "zlib";
import { Readable, Writable } from "stream";

import { Triple } from "./triple";
import { UriPatterns, UriPattern } from "./uri-patterns";
import { TripleReader } from "./triple-reader";

import * as N3 from "n3";
import { Util as N3Util, N3StreamParser } from "n3";
import * as commander from "commander";

class OccurrenciesCounter {
    items: Map<string, number>;

    constructor() {
        this.items = new Map<string, number>();
    }

    add(item: string) {
        let n = this.items.get(item);
        if (!n) {
            n = 0;
        }
        this.items.set(item, n + 1);
    }

    get size(): number {
        return this.items.size;
    }

    get total(): number {
        let sum = 0;
        this.items.forEach(n => {
            sum += n;
        })
        return sum;
    }

    toJSON(): { [key: string]: number } {
        const obj: { [key: string]: number } = {};
        this.items.forEach((n, item) => {
            obj[item] = n;
        });
        return obj;
    }
}

class Statistics {
    subjectOccurrencies = new OccurrenciesCounter();
    classAndNumInstances = new OccurrenciesCounter();
    objectOccurrencies = new OccurrenciesCounter();
    predicateOccurencies = new OccurrenciesCounter();
    datatypeOccurrencies = new OccurrenciesCounter();
    linkOccurrencies = new OccurrenciesCounter();
    numTriples = 0;
    numSubjects = 0;
    numObjects = 0;
    numLiterals = 0;
    numClasses = 0;
    numPredicates = 0;
    numDatatypes = 0;
    numLinks = 0;

    computeDerivations() {
        this.numSubjects = this.subjectOccurrencies.size;
        this.numClasses = this.classAndNumInstances.size;
        this.numObjects = this.objectOccurrencies.size;
        this.numPredicates = this.predicateOccurencies.size;
        this.numDatatypes = this.datatypeOccurrencies.size;
        this.numLinks = this.linkOccurrencies.total;
    }
}

const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';

class Consumer extends Writable {
    statictics = new Statistics();
    uriWhitelistPattern: UriPatterns;

    constructor(uriWhitelistPattern: UriPatterns) {
        super({ objectMode: true })
        this.uriWhitelistPattern = uriWhitelistPattern;
    }

    _write(triple: Triple, encoding: string, done: () => void) {
        const st = this.statictics;
        const s = triple.subject;
        const p = triple.predicate;
        const o = triple.object;
        st.numTriples++;
        st.subjectOccurrencies.add(s);

        if (p === rdfType) {
            st.classAndNumInstances.add(o);
        }

        st.predicateOccurencies.add(p);

        if (N3Util.isLiteral(o)) {
            st.numLiterals++;
            const t = N3Util.getLiteralType(o);
            st.datatypeOccurrencies.add(t);
        } else {
            st.objectOccurrencies.add(o);
        }

        if (p === rdfsSeeAlso) {
            const e = this.uriWhitelistPattern.match(o)
            if (e) {
                st.linkOccurrencies.add(e.name);
            }
        }

        done();
    }
}

export class Aramashi {
    uriWhitelist: UriPatterns = new UriPatterns();
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
            this.uriWhitelist = await UriPatterns.loadTsv(this.commander.linkPatterns);
        }

        this.commander.args.forEach(async (fn) => {
            const r = await this.statistics(fn)
            console.log(JSON.stringify(r, null, 2));
        });
    };

    statistics(path: string) {
        const stream = TripleReader.fromFile(path).stream();

        const consumer = new Consumer(this.uriWhitelist);
        stream.pipe(consumer);

        return new Promise((resolve, reject) => {
            stream.on('end', () => {
                consumer.statictics.computeDerivations();
                resolve(consumer.statictics);
            });
        });
    }
}
