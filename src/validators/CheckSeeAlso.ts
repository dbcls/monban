import { TriplewiseValidator } from "../triplewise-validator";
import { ValidationError } from "../validation-error";
import { Triple } from "../triple";

const rdfsSeeAlso = 'http://www.w3.org/2000/01/rdf-schema#seeAlso';
const identifiersOrgStem = 'http://identifiers.org/'

export class CheckSeeAlso extends TriplewiseValidator {
    validate(triple: Triple): ValidationError[] {
        if (triple.predicate != rdfsSeeAlso) {
            return [];
        }
        if (this.isAcceptable(triple.object)) {
            return [];
        }
        return [
            {
                message: `${triple.object} is not expected URI for rdfs:seeAlso`
            }
        ];
    }
    isAcceptable(o: string): boolean {
        if (o.startsWith(identifiersOrgStem)) {
            return true;
        }
        if (this.config.uriWhitelist.match(o)) {
            return true;
        }
        return false;
    }
}
