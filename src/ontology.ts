import * as fs from "fs";
import * as zlib from "zlib";
import { Readable, Writable } from "stream";

import * as N3 from "n3";
import { N3StreamParser } from "n3";

import { Triple } from "./triple";

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

const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const owl = "http://www.w3.org/2002/07/owl#"
const owlClass = owl + "Class";
const owlDatatypeProperty = owl + "DatatypeProperty";
const owlObjectProperty = owl + "ObjectProperty";

export class Ontology {
    classes: Set<string> = new Set();
    dataProperties: Set<string> = new Set();
    objectProperties: Set<string> = new Set();

    isDataProperty(s: string): boolean {
        return this.dataProperties.has(s);
    }
    isObjectProperty(s: string): boolean {
        return this.objectProperties.has(s);
    }
    isProprety(s: string): boolean {
        return this.isDataProperty(s) || this.isObjectProperty(s);
    }
    isClass(s: string): boolean {
        return this.classes.has(s);
    }

    static load(path: string): Promise<Ontology> {
        const ontology = new Ontology();
        if (!path) {
            return Promise.resolve(ontology);
        }
        const stream = tripleStream(path);
        class OntologyConsumer extends Writable {
            constructor() {
                super({ objectMode: true });
            }
            _write(triple: Triple, encoding: string, done: () => void) {
                if (triple.predicate === rdfType) {
                    const s = triple.subject;
                    switch (triple.object) {
                        case owlClass:
                            ontology.classes.add(s);
                            break;
                        case owlDatatypeProperty:
                            ontology.dataProperties.add(s);
                            break;
                        case owlObjectProperty:
                            ontology.objectProperties.add(s);
                            break;
                    }
                }
                done();
            }
        }
        const oc = new OntologyConsumer();
        stream.pipe(oc);
        return new Promise((resolve, reject) => {
            stream.on('end', () => {
                resolve(ontology);
            });
        });
    }
}