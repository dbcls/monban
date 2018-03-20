import * as N3 from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorLangtagMismatch } from "../error";

N3.Util; // Workaround to load N3.Util

const xsdLangString = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

function guessLanguage(value: string): string {
    const re = /[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]/;
    return value.match(re) ? 'ja' : 'en';
}

export class Langtag extends TriplewiseValidator {
    triple(triple: Triple) {
        if (!N3.Util.isLiteral(triple.object)) {
            return;
        }
        const type = N3.Util.getLiteralType(triple.object);
        if (type !== xsdLangString) {
            return;
        }
        const value = N3.Util.getLiteralValue(triple.object);
        const lang = N3.Util.getLiteralLanguage(triple.object);

        const guess = guessLanguage(value);
        if (lang !== guess) {
            this.error(new ErrorLangtagMismatch(triple.object, guess));
        }
    }
}