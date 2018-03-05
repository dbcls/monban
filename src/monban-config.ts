import { UriWhitelist } from "./uri-whitelist";
import { Ontology } from "./ontology";

export class MonbanConfig {
    primalClasses: Set<string> = new Set<string>();
    uriWhitelist: UriWhitelist = new UriWhitelist();
    ontology: Ontology = new Ontology();
}