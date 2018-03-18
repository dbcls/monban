import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';

export class CheckSeeAlso extends TriplewiseValidator {
    seeAlsos: Map<string, Set<string>> = new Map<string, Set<string>>();

    triple(triple: Triple) {
        if (triple.predicate === rdfsSeeAlso) {
            let sa = this.seeAlsos.get(triple.subject);
            if (!sa) {
                sa = new Set<string>();
                this.seeAlsos.set(triple.subject, sa);
            }
            sa.add(triple.object);
        }
    }

    done() {
        this.seeAlsos.forEach((os, s) => {
            const uris = Array.from(os.keys());
            if (this.blacklistedUriFound(uris) && (!this.whitelistedUriFound(uris))) {
                this.errorOnNode(s, `no suitable seeAlso objects found for subject ${s}; found: ${uris.join(', ')}`);
            }
        });
    }

    blacklistedUriFound(uris: string[]): boolean {
        return uris.some(this.isInBlacklist.bind(this));
    }

    whitelistedUriFound(uris: string[]): boolean {
        return uris.some(this.isInWhitelist.bind(this));
    }

    isInBlacklist(uri: string): boolean {
        return !!this.config.uriBlacklist.match(uri);
    }

    isInWhitelist(uri: string): boolean {
        return !!this.config.uriWhitelist.match(uri);
    }
}
