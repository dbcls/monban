import * as fs from "fs";
import * as zlib from "zlib";
import { Readable, Writable } from "stream";

import { Triple } from "./triple";
import { UriWhitelist, UriWhitelistEntry } from "./uri-whitelist";

import * as N3 from "n3";
import { N3StreamParser } from "n3";
import * as commander from "commander";

function tripleStream(path: string): N3StreamParser {
    const streamParser = N3.StreamParser();
    const inputStream = fs.createReadStream(path);
    let rdfStream: Readable;
    rdfStream = inputStream;

    if (path.endsWith('.gz')) {
        rdfStream = rdfStream.pipe(zlib.createGunzip());
    }
    return rdfStream.pipe(streamParser);
}

class Statistics {
    subjectOccurrencies: { [key: string]: number } = {};
    classAndNumInstances: { [key: string]: number } = {};
    objectOccurrencies: { [key: string]: number } = {};
    predicateOccurencies: { [key: string]: number } = {};
    datatypeOccurrencies: { [key: string]: number } = {};
    linkOccurrencies: { [key: string]: number } = {};
    numTriples = 0;
    numSubjects = 0;
    numObjects = 0;
    numLiterals = 0;
    numClasses = 0;
    numPredicates = 0;
    numDatatypes = 0;
    numLinks = 0;

    computeDerivations() {
        this.numSubjects = Object.keys(this.subjectOccurrencies).length;
        this.numClasses = Object.keys(this.classAndNumInstances).length;
        this.numObjects = Object.keys(this.objectOccurrencies).length;
        this.numLiterals = Object.keys(this.objectOccurrencies).filter((o) => N3.Util.isLiteral(o)).length;
        this.numPredicates = Object.keys(this.predicateOccurencies).length;
        this.numDatatypes = Object.keys(this.datatypeOccurrencies).length;
        this.numLinks = Object.keys(this.linkOccurrencies).reduce((acc, k): number => acc + this.linkOccurrencies[k], 0);
    }
}

const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';

class Consumer extends Writable {
    statictics = new Statistics();
    uriWhitelistPattern: UriWhitelist;

    constructor(uriWhitelistPattern: UriWhitelist) {
        super({ objectMode: true })
        this.uriWhitelistPattern = uriWhitelistPattern;
    }

    _write(triple: Triple, encoding: string, done: () => void) {
        const st = this.statictics;
        const s = triple.subject;
        const p = triple.predicate;
        const o = triple.object;
        st.numTriples++;
        st.subjectOccurrencies[s] = (st.subjectOccurrencies[s] === undefined ? 0 : st.subjectOccurrencies[s]) + 1;

        if (p === rdfType) {
            st.classAndNumInstances[o] = (st.classAndNumInstances[o] === undefined ? 0 : st.classAndNumInstances[o]) + 1;
        }

        st.predicateOccurencies[p] = (st.predicateOccurencies[p] === undefined ? 0 : st.predicateOccurencies[p]) + 1;

        if (N3.Util.isLiteral(o)) {
            const t = N3.Util.getLiteralType(o);
            st.datatypeOccurrencies[t] = (st.datatypeOccurrencies[t] === undefined ? 0 : st.datatypeOccurrencies[t]) + 1
        }

        // NOTE below is too memory consuming for some datasets
        st.objectOccurrencies[o] = (st.objectOccurrencies[o] === undefined ? 0 : st.objectOccurrencies[o]) + 1;

        if (p === rdfsSeeAlso) {
            const e = this.uriWhitelistPattern.match(o)
            if (e) {
                const ln = e.name;
                st.linkOccurrencies[ln] = (st.linkOccurrencies[ln] === undefined ? 0 : st.linkOccurrencies[ln]) + 1;
            }
        }

        done();
    }
}

export class Aramashi {
    uriWhitelist: UriWhitelist = new UriWhitelist();
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
            this.uriWhitelist = await UriWhitelist.loadTsv(this.commander.linkPatterns);
        }

        this.commander.args.forEach(async (fn) => {
            const r = await this.statistics(fn)
            console.log(JSON.stringify(r, null, 2));
        });
    };

    statistics(path: string) {
        const stream = tripleStream(path);

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
