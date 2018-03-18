import * as N3 from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const sio = 'http://semanticscience.org/resource/';
const sio000216 = sio + 'SIO_000216'; // has measurement value
const sio000221 = sio + 'SIO_000221'; // has unit
const sio000300 = sio + 'SIO_000300'; // has value

const uoRegexp = new RegExp('^http://purl\.obolibrary\.org/obo/UO_\\d+');

const xsd = 'http://www.w3.org/2001/XMLSchema#';

const numericTypes: Set<string> = new Set<string>([
    xsd + 'int',
    xsd + 'integer',
    xsd + 'decimal',
    xsd + 'float',
    xsd + 'decimal',
    xsd + 'double',
]);

function isNumeric(node: string): boolean {
    if (!N3.Util.isLiteral(node)) {
        return false;
    }
    const type = N3.Util.getLiteralType(node);
    return numericTypes.has(type);
}


export class ValueWithUnit extends TriplewiseValidator {
    store: any = N3.Store();
    objectsOfSio000216: Set<string> = new Set<string>();
    subjectsOfSio000221: Set<string> = new Set<string>();
    subjectsOfSio000300: Set<string> = new Set<string>();

    triple(triple: Triple) {
        [this.pass0, this.pass1][this.pass].bind(this)(triple);
    }

    done() {
        if (this.pass === 0) {
            return;
        }

        this.objectsOfSio000216.forEach(s => {
            const values = <string[]>this.store.getObjects(s, sio000300);
            if (values.length === 0) {
                this.errorOnNode(s, `${s} has no sio:SIO_000300 predicates`)
            }
            values.forEach(v => {
                if (!isNumeric(v)) {
                    this.errorOnNode(v, `value ${v} is not numeric; in the context of ${s} sio:SIO_000300 ${v}`)
                }
            });

            const units = <string[]>this.store.getObjects(s, sio000221);
            if (units.length === 0) {
                this.errorOnNode(s, `${s} has no sio:SIO_000221 predicates`);
            }
            units.forEach(u => {
                if (!u.match(uoRegexp)) {
                    this.errorOnNode(u, `${u} is not a class of Units of Measurement Ontology; in the context of ${s} sio:SIO_000221 ${u}`)
                }
            });
        });

        this.subjectsOfSio000221.forEach(s => {
            if (this.store.countTriples(null, sio000216, s) === 0) {
                this.errorOnNode(s, `no sio:SIO_000216 found with object ${s}`);
            }

            const values = <string[]>this.store.getObjects(s, sio000300);
            if (values.length === 0) {
                this.errorOnNode(s, `${s} has no sio:SIO_000300 predicates`)
            }
            values.forEach(v => {
                if (!isNumeric(v)) {
                    this.errorOnNode(v, `value ${v} is not numeric; in the context of ${s} sio:SIO_000300 ${v}`)
                }
            });
        });

        this.subjectsOfSio000300.forEach(s => {
            if (this.store.countTriples(null, sio000216, s) === 0) {
                this.errorOnNode(s, `no sio:SIO_000216 found with object ${s}`);
            }

            const units = <string[]>this.store.getObjects(s, sio000221);
            if (units.length === 0) {
                this.errorOnNode(s, `${s} has no sio:SIO_000221 predicates`);
            }
            units.forEach(u => {
                if (!u.match(uoRegexp)) {
                    this.errorOnNode(u, `${u} is not a class of Units of Measurement Ontology; in the context of ${s} sio:SIO_000221 ${u}`)
                }
            });
        })
    }

    pass0(triple: Triple) {
        switch (triple.predicate) {
            case sio000216:
                this.objectsOfSio000216.add(triple.object);
                break;
            case sio000221:
                this.subjectsOfSio000221.add(triple.subject);
                break;
            case sio000300:
                this.subjectsOfSio000300.add(triple.subject);
                break;
        }
    }

    pass1(triple: Triple) {
        if (this.objectsOfSio000216.has(triple.subject)) {
            this.store.addTriple(triple);
        }
        if (this.subjectsOfSio000221.has(triple.object)) {
            this.store.addTriple(triple);
        }
        if (this.subjectsOfSio000300.has(triple.object)) {
            this.store.addTriple(triple);
        }
    }

    numPassesRequired() { return 2; }
}