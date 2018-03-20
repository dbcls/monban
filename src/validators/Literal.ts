import * as N3 from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

N3.Util; // Workaround to load N3.Util

/*
xsd:anyURI
xsd:string
xsd:dateTime
xsd:float
xsd:decimal
xsd:double
xsd:time
xsd:date
*/

const pattern = {
  integer: /^[+-]?[0-9]+$/
};

const patternFor: {[key: string]: RegExp} = {
  'http://www.w3.org/2001/XMLSchema#integer':             pattern.integer,
  'http://www.w3.org/2001/XMLSchema#nonPositiveInteger':  pattern.integer,
  'http://www.w3.org/2001/XMLSchema#negativeInteger':     pattern.integer,
  'http://www.w3.org/2001/XMLSchema#long':                pattern.integer,
  'http://www.w3.org/2001/XMLSchema#int':                 pattern.integer,
  'http://www.w3.org/2001/XMLSchema#short':               pattern.integer,
  'http://www.w3.org/2001/XMLSchema#byte':                pattern.integer,
  'http://www.w3.org/2001/XMLSchema#nonNegativeInteger':  pattern.integer,
  'http://www.w3.org/2001/XMLSchema#unsignedLong':        pattern.integer,
  'http://www.w3.org/2001/XMLSchema#unsignedInt':         pattern.integer,
  'http://www.w3.org/2001/XMLSchema#unsignedShort':       pattern.integer,
  'http://www.w3.org/2001/XMLSchema#unsignedByte':        pattern.integer,
  'http://www.w3.org/2001/XMLSchema#positiveInteger':     pattern.integer,
};

export class Literal extends TriplewiseValidator {
  triple(triple: Triple) {
    if (!N3.Util.isLiteral(triple.object)) { return; }

    const type  = N3.Util.getLiteralType(triple.object);
    const value = N3.Util.getLiteralValue(triple.object);

    const pattern = patternFor[type];

    if (!pattern)             { return; }
    if (value.match(pattern)) { return; }

    this.errorOnNode(value, `illegal value '${value}' for ${type}`);
  }
}
