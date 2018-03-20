import * as N3 from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorLiteralFormat } from "../error";

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

type Checker = (value: string) => boolean;

function xsd(typeName: string): string {
  return `http://www.w3.org/2001/XMLSchema#${typeName}`;
}

function match(patternName: string): Checker {
  const pat = pattern[patternName];

  return value => !!value.match(pat);
}

const pattern: { [key: string]: RegExp } = {
  integer: /^[+-]?[0-9]+$/,
  decimal: /^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/,
  numeric: /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/,
};

const checkerFor: { [key: string]: Checker } = {
  [xsd('integer')]: match('integer'),
  [xsd('nonPositiveInteger')]: match('integer'),
  [xsd('negativeInteger')]: match('integer'),
  [xsd('long')]: match('integer'),
  [xsd('int')]: match('integer'),
  [xsd('short')]: match('integer'),
  [xsd('byte')]: match('integer'),
  [xsd('nonNegativeInteger')]: match('integer'),
  [xsd('unsignedLong')]: match('integer'),
  [xsd('unsignedInt')]: match('integer'),
  [xsd('unsignedShort')]: match('integer'),
  [xsd('unsignedByte')]: match('integer'),
  [xsd('positiveInteger')]: match('integer'),
  [xsd('decimal')]: match('decimal'),
  [xsd('float')]: match('numeric'),
  [xsd('double')]: match('numeric'),
};

export class Literal extends TriplewiseValidator {
  triple(triple: Triple) {
    if (!N3.Util.isLiteral(triple.object)) { return; }

    const type = N3.Util.getLiteralType(triple.object);
    const value = N3.Util.getLiteralValue(triple.object);
    const checker = checkerFor[type];

    if (!checker) { return; }
    if (checker(value)) { return; }

    this.error(new ErrorLiteralFormat(value, type));
  }
}
