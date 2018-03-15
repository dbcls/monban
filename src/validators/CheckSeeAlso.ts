import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';
const identifiersOrgStem = 'http://identifiers.org/'

export class CheckSeeAlso extends TriplewiseValidator {
    seeAlsos: Map<string, Set<string>> = new Map<string, Set<string>>();

    validate(triple: Triple): ValidationError[] {
        if (triple.predicate === rdfsSeeAlso) {
            let sa = this.seeAlsos.get(triple.subject);
            if (!sa) {
                sa = new Set<string>();
                this.seeAlsos.set(triple.subject, sa);
            }
            sa.add(triple.object);
        }
        return [];
    }

    done(): ValidationError[] {
        const errors: ValidationError[] = [];
        this.seeAlsos.forEach((os, s) => {
            const uris = Array.from(os.keys());
            console.log(uris, this.blacklistedUriFound(uris), this.whitelistedUriFound(uris));
            if (this.blacklistedUriFound(uris) && (!this.whitelistedUriFound(uris))) {
                errors.push({ message: `no suitable seeAlso objects found for subject ${s}; found: ${uris.join(', ')}` });
            }
        });
        return errors;
    }

    blacklistedUriFound(uris: string[]): boolean {
        console.log(this.config.uriBlacklist)
        return uris.some(this.isInBlacklist.bind(this));
    }

    whitelistedUriFound(uris: string[]): boolean {
        return uris.some(this.isInWhitelist.bind(this));
    }

    isInBlacklist(uri: string): boolean {
        return !!this.config.uriBlacklist.match(uri);
    }

    isInWhitelist(uri: string): boolean {
        if (uri.startsWith(identifiersOrgStem)) {
            return true;
        }
        if (this.config.uriWhitelist.match(uri)) {
            return true;
        }
        return false;
    }
}
