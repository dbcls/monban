import * as N3 from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

N3.Util; // Workaround to load N3.Util

/*
xsd:anyURI
xsd:string
xsd:dateTime
xsd:integer
xsd:float
xsd:decimal
xsd:double
xsd:time
xsd:date
xsd:int
*/

export class Literal extends TriplewiseValidator {
  validate(triple: Triple) {
    if (!N3.Util.isLiteral(triple.object)) {
      return [];
    }
    const type = N3.Util.getLiteralType(triple.object);
    const value = N3.Util.getLiteralValue(triple.object);
    switch (type) {
      case 'http://www.w3.org/2001/XMLSchema#int':
        if (!value.match(/^[+-]?[0-9]+$/)) {
          this.errorOnNode(value, `illegal integer value '${value}'`);
        }
    }
    return [];
  }
}
