import * as shex from "shex";
import * as n3 from "n3";

export class Shex {
    run() {
        const shexc = 'http://shex.io/examples/Issue.shex';
        const node = "http://integbio.jp/dbcatalog/record/nbdc00001"
        const shape = "http://a.example/dcterms-references-test";

        const c = `prefix dcterms: <http://purl.org/dc/terms/>

        <http://a.example/dcterms-references-test> {
          dcterms:references [
            <http://identifiers.org/pmc/>~
            <http://doi.org/>~
            <http://identifiers.org/pubmed/>~
          ]*;
        }
        `
        const data = `
        @prefix dcterms: <http://purl.org/dc/terms/> .
        @prefix pubmed: <http://identifiers.org/pubmed/> .

        <http://integbio.jp/dbcatalog/record/nbdc00001>
            dcterms:references pubmed:27984737, pubmed:27863956.
        `;

        const Schema = shex.Parser.construct(shexc).parse(c);
        const store = n3.Store();

        var parser = n3.Parser();
        parser.parse(data, (error, triple, prefix) => {
            if (triple) {
                store.addTriple(triple.subject, triple.predicate, triple.object);
            } else {
                const results = shex.Validator.construct(Schema).validate(store, node, shape);

                console.log("RESULTS", JSON.stringify(results, null, 2));
                console.log("TYPE", results.type)
            }
        });
    }
}
