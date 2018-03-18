import { TriplewiseValidator } from "../triplewise-validator";
import { Triple } from "../triple";

const sio = 'http://semanticscience.org/resource/';
const sio000216 = sio + 'SIO_000216';
const sio000221 = sio + 'SIO_000221';
const sio000300 = sio + 'SIO_000300';

const uoRegexp = new RegExp('http://purl.obolibrary.org/obo/UO_\d+');

export class ValueWithUnit extends TriplewiseValidator {
    triple(triple: Triple) {
        // FIXME WIP
        return [];
    }
}