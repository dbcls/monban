import * as fs from "fs";
import { Readable } from "stream";
import * as zlib from "zlib";

import { N3StreamParser } from "n3";
import * as N3 from "n3";


export class TripleStream {
    static fromFile(path: string): N3StreamParser {
        const streamParser = N3.StreamParser();
        (<any>N3.Parser)._resetBlankNodeIds(); // make sure we have the same ids on different passes

        const inputStream = fs.createReadStream(path);
        let rdfStream: Readable;
        rdfStream = inputStream;

        if (path.endsWith('.gz')) {
            rdfStream = rdfStream.pipe(zlib.createGunzip());
        }
        return rdfStream.pipe(streamParser);
    }
}