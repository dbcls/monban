import * as fs from "fs";
import { Readable, Writable } from "stream";
import { Triple } from "./Triple";

import * as N3 from "n3";
import * as zlib from "zlib";

import { N3StreamParser } from "n3";

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
    numTriples = 0;
    numSubjects = 0;
    numObjects = 0;
    numLiterals = 0;
    numClasses = 0;
    numPredicates = 0;
    numDatatypes = 0;

    computeDerivations() {
        this.numSubjects = Object.keys(this.subjectOccurrencies).length;
        this.numClasses = Object.keys(this.classAndNumInstances).length;
        this.numObjects = Object.keys(this.objectOccurrencies).length;
        this.numLiterals = Object.keys(this.objectOccurrencies).filter((o) => N3.Util.isLiteral(o)).length;
        this.numPredicates = Object.keys(this.predicateOccurencies).length;
        this.numDatatypes = Object.keys(this.datatypeOccurrencies).length;
    }
}

const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

class Consumer extends Writable {
    statictics = new Statistics();

    constructor() {
        super({ objectMode: true })
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
        done();
    }
}

class Aramashi {
    statistics(path: string) {
        const stream = tripleStream(path);

        const consumer = new Consumer();
        stream.pipe(consumer);

        return new Promise((resolve, reject) => {
            stream.on('end', () => {
                consumer.statictics.computeDerivations();
                resolve(consumer.statictics);
            });
        });
    }
}

module.exports = Aramashi;