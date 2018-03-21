import { Util as N3Util, Store as N3Store } from "n3";
import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";
import { ErrorSio000300NotFound, ErrorSio000221NotFound, ErrorSio000216NotFound, ErrorValueIsNotNumeric, ErrorObjectIsNotUOClass } from "../error";

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
    xsd + 'double',
]);

function isNumeric(node: string): boolean {
    if (!N3Util.isLiteral(node)) {
        return false;
    }
    const type = N3Util.getLiteralType(node);
    return numericTypes.has(type);
}


export class ValueWithUnit extends TriplewiseValidator {
    store: any = N3Store();
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
                this.error(new ErrorSio000300NotFound(s));
            }
            values.forEach(v => {
                if (!isNumeric(v)) {
                    this.error(new ErrorValueIsNotNumeric({ subject: s, predicate: sio000300, object: v, graph: '', nth: undefined }));
                }
            });

            const units = <string[]>this.store.getObjects(s, sio000221);
            if (units.length === 0) {
                this.error(new ErrorSio000221NotFound(s));
            }
            units.forEach(u => {
                if (!u.match(uoRegexp)) {
                    this.error(new ErrorObjectIsNotUOClass({ subject: s, predicate: sio000221, object: u, graph: '', nth: undefined }));
                }
            });
        });

        this.subjectsOfSio000221.forEach(s => {
            if (this.store.countTriples(null, sio000216, s) === 0) {
                this.error(new ErrorSio000216NotFound(s));
            }

            const values = <string[]>this.store.getObjects(s, sio000300);
            if (values.length === 0) {
                this.error(new ErrorSio000300NotFound(s));
            }
            values.forEach(v => {
                if (!isNumeric(v)) {
                    this.error(new ErrorValueIsNotNumeric({ subject: s, predicate: sio000300, object: v, graph: '', nth: undefined }));
                }
            });
        });

        this.subjectsOfSio000300.forEach(s => {
            if (this.store.countTriples(null, sio000216, s) === 0) {
                this.error(new ErrorSio000216NotFound(s))
            }

            const units = <string[]>this.store.getObjects(s, sio000221);
            if (units.length === 0) {
                this.error(new ErrorSio000221NotFound(s));
            }
            units.forEach(u => {
                if (!u.match(uoRegexp)) {
                    this.error(new ErrorObjectIsNotUOClass({ subject: s, predicate: sio000221, object: u, graph: '', nth: undefined }));
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