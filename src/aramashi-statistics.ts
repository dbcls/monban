import { Writable } from "stream";
import * as fs from "fs";
import * as util from "util";
import { ZlibOptions } from "zlib";

import * as N3 from "n3";
import { Util as N3Util, N3StreamParser } from "n3";
import * as uuid from "uuid";

import { Triple } from "./triple";
import { UriPatterns, UriPattern } from "./uri-patterns";
import { TripleReader } from "./triple-reader";

const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';

class OccurrenciesCounter {
    items: Map<string, number>;

    constructor() {
        this.items = new Map<string, number>();
    }

    add(item: string, delta: number = 1) {
        let n = this.items.get(item);
        if (!n) {
            n = 0;
        }
        this.items.set(item, n + delta);
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

    load(obj: { [key: string]: number }): void {
        this.items.clear();
        Object.keys(obj).forEach(k => {
            const n = obj[k];
            this.items.set(k, n);
        });
    }

    merge(that: OccurrenciesCounter): OccurrenciesCounter {
        that.items.forEach((n, item) => {
            this.add(item, n);
        });
        return this;
    }
}

export class Statistics {
    subjectOccurrencies = new OccurrenciesCounter();
    classAndNumInstances = new OccurrenciesCounter();
    objectOccurrencies = new OccurrenciesCounter();
    predicateOccurencies = new OccurrenciesCounter();
    datatypeOccurrencies = new OccurrenciesCounter();
    linkOccurrencies = new OccurrenciesCounter();
    numTriples = 0;
    numLiterals = 0;

    numSubjects = 0;
    numClasses = 0;
    numObjects = 0;
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

    load(obj: any): void {
        this.subjectOccurrencies.load(obj.subjectOccurrencies);
        this.classAndNumInstances.load(obj.classAndNumInstances);
        this.objectOccurrencies.load(obj.objectOccurrencies);
        this.predicateOccurencies.load(obj.predicateOccurencies);
        this.datatypeOccurrencies.load(obj.datatypeOccurrencies);
        this.linkOccurrencies.load(obj.linkOccurrencies);

        this.numTriples = obj.numTriples;
        this.numLiterals = obj.numLiterals;
        this.computeDerivations();
    }

    merge(that: Statistics): Statistics {
        this.subjectOccurrencies.merge(that.subjectOccurrencies);
        this.classAndNumInstances.merge(that.classAndNumInstances);
        this.objectOccurrencies.merge(that.objectOccurrencies);
        this.predicateOccurencies.merge(that.predicateOccurencies);
        this.datatypeOccurrencies.merge(that.datatypeOccurrencies);
        this.linkOccurrencies.merge(that.linkOccurrencies);

        this.numTriples += that.numTriples;
        this.numLiterals += that.numLiterals;

        this.computeDerivations();
        return this;
    }

    static async loadFromFile(path: string): Promise<Statistics> {
        const st = new Statistics();
        const buf = await util.promisify(fs.readFile)(path);
        const obj = JSON.parse(buf.toString());

        st.load(obj);
        return st;
    }
}

class Consumer extends Writable {
    statictics = new Statistics();
    linkPatterns: UriPatterns;
    uuid: string = uuid.v4();

    constructor(linkPatterns: UriPatterns) {
        super({ objectMode: true })
        this.linkPatterns = linkPatterns;
    }

    uniquifyBlankNode(node: string): string {
        if (N3Util.isBlank(node)) {
            return node + "." + this.uuid;
        }
        return node;
    }

    _write(triple: Triple, encoding: string, done: () => void) {
        const st = this.statictics;
        const s = this.uniquifyBlankNode(triple.subject);
        const p = this.uniquifyBlankNode(triple.predicate);
        const o = this.uniquifyBlankNode(triple.object);
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
            const e = this.linkPatterns.match(o)
            if (e) {
                st.linkOccurrencies.add(e.name);
            }
        }

        done();
    }
}

export class Counter {
    linkPatterns: UriPatterns;

    constructor(linkPatterns: UriPatterns) {
        this.linkPatterns = linkPatterns;
    }

    statistics(path: string): Promise<Statistics> {
        const stream = TripleReader.fromFile(path).stream();

        const consumer = new Consumer(this.linkPatterns);
        stream.pipe(consumer);

        return new Promise((resolve, reject) => {
            stream.on('end', () => {
                consumer.statictics.computeDerivations();
                resolve(consumer.statictics);
            });
        });
    }
}