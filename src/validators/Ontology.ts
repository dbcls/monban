import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const owl = "http://www.w3.org/2002/07/owl#"
const owlClass = owl + "Class";

const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const rdfsLabel = rdfs + "label";
const rdfsRange = rdfs + "range";
const rdfsDomain = rdfs + "domain";

const owlPropertyClasses = new Set<string>([
    owl + "DatatypeProperty",
    owl + "ObjectProperty",
    owl + "AnnotationProperty",
]);

function isProperty(s: string): boolean {
    return owlPropertyClasses.has(s);
}

function isClass(s: string): boolean {
    return s === owlClass;
}

export class Ontology extends TriplewiseValidator {
    properties: Set<string> = new Set<string>();
    classes: Set<string> = new Set<string>();
    labeled: Set<string> = new Set<string>();
    rangeDefined: Set<string> = new Set<string>();
    domainDefined: Set<string> = new Set<string>();

    validate(triple: Triple): ValidationError[] {
        switch (triple.predicate) {
            case rdfType:
                if (isProperty(triple.object)) {
                    this.properties.add(triple.subject);
                }
                if (isClass(triple.object)) {
                    this.classes.add(triple.subject);
                }
                break;
            case rdfsLabel:
                this.labeled.add(triple.subject);
                break;
            case rdfsDomain:
                this.domainDefined.add(triple.subject);
                break;
            case rdfsRange:
                this.rangeDefined.add(triple.subject);
                break;
        }

        return [];
    }

    done(): ValidationError[] {
        const errors: ValidationError[] = [];

        this.properties.forEach(p => {
            if (!this.labeled.has(p)) {
                errors.push({ message: `${p} is a property, but rdfs:label is not found for it` });
            }
            if (!this.domainDefined.has(p)) {
                errors.push({ message: `${p} is a property, but rdfs:domain is not found for it` });
            }
            if (!this.rangeDefined.has(p)) {
                errors.push({ message: `${p} is a property, but rdfs:range is not found for it` });
            }
        });

        this.classes.forEach(c => {
            if (!this.labeled.has(c)) {
                errors.push({ message: `${c} is a class, but rdfs:label is not found for it` });
            }
        });

        return errors;
    }
}