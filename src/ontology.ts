import * as fs from "fs";
import * as zlib from "zlib";
import { Readable, Writable } from "stream";

import * as N3 from "n3";
import { N3StreamParser } from "n3";

import { Triple } from "./triple";
import { TripleReader } from "./triple-reader";

const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const owl = "http://www.w3.org/2002/07/owl#"
const owlClass = owl + "Class";
const owlDatatypeProperty = owl + "DatatypeProperty";
const owlObjectProperty = owl + "ObjectProperty";
const owlAnnotationProperty = owl + "AnnotationProperty";

export class Ontology {
    classes: Set<string> = new Set();
    dataProperties: Set<string> = new Set();
    objectProperties: Set<string> = new Set();
    annotationProperties: Set<string> = new Set();

    isDataProperty(s: string): boolean {
        return this.dataProperties.has(s);
    }
    isObjectProperty(s: string): boolean {
        return this.objectProperties.has(s);
    }
    isAnnotationProperty(s: string): boolean {
        return this.annotationProperties.has(s);
    }
    isProprety(s: string): boolean {
        return this.isDataProperty(s) || this.isObjectProperty(s) || this.isAnnotationProperty(s);
    }
    isClass(s: string): boolean {
        return this.classes.has(s);
    }

    load(path: string): Promise<void> {
        const stream = TripleReader.fromFile(path).stream();
        const ontology = this;
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
                        case owlAnnotationProperty:
                            ontology.annotationProperties.add(s);
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
                resolve();
            });
        });
    }

    static async load(paths: string[]): Promise<Ontology> {
        const ontology = new Ontology();
        await Promise.all(
            paths.map(path => ontology.load(path))
        );
        return ontology;
    }
}
