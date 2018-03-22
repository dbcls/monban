import { UriPatterns, UriPattern } from "./uri-patterns";
import { Ontology } from "./ontology";

export class MonbanConfig {
    // lint
    primalClasses: Set<string> = new Set<string>();
    uriWhitelist: UriPatterns = new UriPatterns();
    uriBlacklist: UriPatterns = new UriPatterns();
    bibPatterns: UriPatterns = new UriPatterns();
    ontology: Ontology = new Ontology();

    // report
    reportLimit = -1;
}