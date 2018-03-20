import { ErrorLiteralFormat } from '../error';
import { Triple } from '../triple';
import { TriplewiseValidator } from '../triplewise-validator';
import { URL } from 'url';
import { Util as N3Util } from 'n3';

type Checker = (value: string) => boolean;

const patterns: { [key: string]: RegExp } = {
  integer: /^[+-]?[0-9]+$/,
  decimal: /^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/,
  numeric: /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+\-]?[0-9]+)?$/,
  date: /^[+-]?\d{4}-[01]\d-[0-3]\d(?:[+-][0-2]\d:[0-5]\d|Z)?$/,
  time: /^[0-5]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:[+-][0-2]\d:[0-5]\d|Z)?$/,
  dateTime: /^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:[+-][0-2]\d:[0-5]\d|Z)?$/,
};

function xsd(typeName: string): string {
  return `http://www.w3.org/2001/XMLSchema#${typeName}`;
}

function match(patternName: string): Checker {
  const pattern = patterns[patternName];

  return value => pattern.test(value);
}

function url(): Checker {
  return value => {
    try {
      new URL(value);
    } catch (e) {
      return false;
    }

    return true;
  }
}

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
  [xsd('date')]: match('date'),
  [xsd('time')]: match('time'),
  [xsd('dateTime')]: match('dateTime'),
  [xsd('anyURI')]: url(),
};

export class Literal extends TriplewiseValidator {
  triple(triple: Triple) {
    if (!N3Util.isLiteral(triple.object)) { return; }

    const type = N3Util.getLiteralType(triple.object);
    const value = N3Util.getLiteralValue(triple.object);
    const checker = checkerFor[type];

    if (!checker) { return; }
    if (checker(value)) { return; }

    this.error(new ErrorLiteralFormat(value, type));
  }
}
