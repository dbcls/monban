import { TriplewiseValidator } from "../TriplewiseValidator";
import { ValidationError } from "../ValidationError";
import { Triple } from "../Triple";

const depiction = 'http://xmlns.com/foaf/0.1/depiction';
const depicts = 'http://xmlns.com/foaf/0.1/depicts';

export class FoafImage extends TriplewiseValidator {
    imageishNodes: { [key: string]: Boolean; } = {};
    depictsOrDepictionSpecified: { [key: string]: Boolean; } = {};

    validate(triple: Triple): ValidationError[] {
        const errors: ValidationError[] = [];
        if (this.isImageish(triple.object) && triple.predicate !== depiction) {
            errors.push({
                message: `object '${triple.object}' is image-ish but '${triple.predicate}' is not 'foaf:depiction'`
            });
            console.log(errors);
        }

        if (triple.predicate === depicts && !this.isImageish(triple.subject)) {
            errors.push({ message: `subject '${triple.subject}' of 'foaf:depicts' is not image-ish` });
        }

        if (this.isImageish(triple.subject)) {
            this.imageishNodes[triple.subject] = true;
        }
        if (this.isImageish(triple.object)) {
            this.imageishNodes[triple.object] = true;
        }
        if (triple.predicate === depicts) {
            this.depictsOrDepictionSpecified[triple.subject] = true;
        }
        if (triple.predicate === depiction) {
            this.depictsOrDepictionSpecified[triple.object] = true;
        }
        return errors;
    }

    done(): ValidationError[] {
        const errors: ValidationError[] = [];
        Object.keys(this.imageishNodes).forEach(s => {
            if (!this.depictsOrDepictionSpecified[s]) {
                errors.push({ message: `'${s}' is image-ish but neither 'foaf:depicts' nor 'foaf:depiction' is found for this` });
            }
        });
        return errors;
    }

    private isImageish(node: string): Boolean {
        return !!node.match(/\.(?:jpg|png|svg)$/i);
    }
}