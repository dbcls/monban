import * as fs from "fs";
import { Readable } from "stream";
import * as zlib from "zlib";

import { N3StreamParser } from "n3";
import * as N3 from "n3";


export class TripleReader {
    static fromFile(path: string): TripleReader {
        return new TripleFileReader(path);
    }

    static fromString(buffer: string): TripleReader {
        return new TripleStringReader(buffer);
    }

    path: string = "";

    stream(): N3StreamParser { return N3.StreamParser(); }
}

class TripleFileReader extends TripleReader {
    path: string;

    constructor(path: string) {
        super();
        this.path = path;
    }

    stream(): N3StreamParser {
        const streamParser = N3.StreamParser();
        (<any>N3.Parser)._resetBlankNodeIds(); // make sure we have the same ids on different passes

        const inputStream = fs.createReadStream(this.path);
        let rdfStream: Readable;
        rdfStream = inputStream;

        if (this.path.endsWith('.gz')) {
            rdfStream = rdfStream.pipe(zlib.createGunzip());
        }
        return rdfStream.pipe(streamParser);
    }
}

class TripleStringReader extends TripleReader {
    buf: string;

    constructor(buf: string) {
        super();
        this.buf = buf;
    }

    stream(): N3StreamParser {
        const streamParser = N3.StreamParser();
        (<any>N3.Parser)._resetBlankNodeIds(); // make sure we have the same ids on different passes
        const s = new Readable();
        s.push(this.buf);
        s.push(null);
        return s.pipe(streamParser);
    }
}