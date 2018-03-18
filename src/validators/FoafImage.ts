import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const depiction = 'http://xmlns.com/foaf/0.1/depiction';
const depicts = 'http://xmlns.com/foaf/0.1/depicts';

export class FoafImage extends TriplewiseValidator {
    imageishNodes: Set<string> = new Set<string>();
    depictsOrDepictionSpecified: Set<string> = new Set<string>();

    triple(triple: Triple) {
        if (this.isImageish(triple.object) && triple.predicate !== depiction) {
            this.errorOnTriple(triple, `object '${triple.object}' is image-ish but '${triple.predicate}' is not 'foaf:depiction'`);
        }

        if (triple.predicate === depicts && !this.isImageish(triple.subject)) {
            this.errorOnTriple(triple, `subject '${triple.subject}' of 'foaf:depicts' is not image-ish`);
        }

        if (this.isImageish(triple.subject)) {
            this.imageishNodes.add(triple.subject);
        }
        if (this.isImageish(triple.object)) {
            this.imageishNodes.add(triple.object);
        }
        if (triple.predicate === depicts) {
            this.depictsOrDepictionSpecified.add(triple.subject);
        }
        if (triple.predicate === depiction) {
            this.depictsOrDepictionSpecified.add(triple.object);
        }
    }

    done() {
        this.imageishNodes.forEach(s => {
            if (!this.depictsOrDepictionSpecified.has(s)) {
                this.errorOnNode(s, `'${s}' is image-ish but neither 'foaf:depicts' nor 'foaf:depiction' is found for this`);
            }
        });
    }

    private isImageish(node: string): Boolean {
        return !!node.match(/\.(?:jpg|png|svg)$/i);
    }
}