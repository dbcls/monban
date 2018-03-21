import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorDepictsDepictionNotFound, ErrorDepictsForNotImageishSubject, ErrorDepictionForNotImageshObject } from "../error";

const depiction = 'http://xmlns.com/foaf/0.1/depiction';
const depicts = 'http://xmlns.com/foaf/0.1/depicts';

export class FoafImage extends TriplewiseValidator {
    imageishNodes: Set<string> = new Set<string>();
    depictsOrDepictionSpecified: Set<string> = new Set<string>();

    triple(triple: Triple) {
        if (this.isImageish(triple.object) && triple.predicate !== depiction) {
            this.error(new ErrorDepictionForNotImageshObject(triple));
        }

        if (triple.predicate === depicts && !this.isImageish(triple.subject)) {
            this.error(new ErrorDepictsForNotImageishSubject(triple));
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
                this.error(new ErrorDepictsDepictionNotFound(s));
            }
        });
    }

    private isImageish(node: string): Boolean {
        return !!node.match(/\.(?:jpg|png|svg)$/i);
    }
}