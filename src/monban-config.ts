import { UriPatterns, UriPattern } from "./uri-patterns";
import { Ontology } from "./ontology";

export class MonbanConfig {
    primalClasses: Set<string> = new Set<string>();
    uriWhitelist: UriPatterns = new UriPatterns();
    uriBlacklist: UriPatterns = new UriPatterns();
    ontology: Ontology = new Ontology();
}