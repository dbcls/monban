import { TriplewiseValidator } from "../TriplewiseValidator";
import { ValidationError } from "../ValidationError";
import { Triple } from "../Triple";

const depiction = 'http://xmlns.com/foaf/0.1/depiction';
const depicts = 'http://xmlns.com/foaf/0.1/depicts';

export class FoafImage extends TriplewiseValidator {
    imageishSubjects: { [key: string]: Boolean; } = {};
    depictsSpecifiedSubjects: { [key: string]: Boolean; } = {};

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
            this.imageishSubjects[triple.subject] = true;
        }
        if (triple.predicate === depicts) {
            this.depictsSpecifiedSubjects[triple.subject] = true;
        }
        return errors;
    }

    done(): ValidationError[] {
        const errors: ValidationError[] = [];
        Object.keys(this.imageishSubjects).forEach(s => {
            if (!this.depictsSpecifiedSubjects[s]) {
                errors.push({ message: `subject '${s}' is image-ish but 'foaf:depicts' is not found for the subject` });
            }
        });
        return errors;
    }

    private isImageish(node: string): Boolean {
        return !!node.match(/\.(?:jpg|png|svg)$/i);
    }
}