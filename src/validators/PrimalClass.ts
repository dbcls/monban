import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const isA = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const rdfsLabel = "http://www.w3.org/2000/01/rdf-schema#label";
const dctermsIdentifier = "http://purl.org/dc/terms/identifier";

export class PrimalClass extends TriplewiseValidator {
    instancesOfPrimalClasses: Set<string> = new Set<string>();
    labeledSubjects: Set<string> = new Set<string>();
    identifierSpecified: Set<string> = new Set<string>();

    validate(triple: Triple) {
        if (triple.predicate === isA && this.config.primalClasses.has(triple.object)) {
            this.instancesOfPrimalClasses.add(triple.subject);
        }
        if (triple.predicate === rdfsLabel) {
            this.labeledSubjects.add(triple.subject);
        }
        if (triple.predicate === dctermsIdentifier) {
            this.identifierSpecified.add(triple.subject);
        }
    }

    done() {
        this.instancesOfPrimalClasses.forEach((inst) => {
            if (!this.labeledSubjects.has(inst)) {
                this.errorOnNode(inst, `'${inst}' is an instance of the primal class but rdfs:label is not found for this`);
            }
            if (!this.identifierSpecified.has(inst)) {
                this.errorOnNode(inst, `'${inst}' is an instance of the primal class but dcterms:identifier is not found for this`);
            }
        });
    }
}