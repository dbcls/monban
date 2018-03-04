import { UriWhitelist } from "./uri-whitelist";

export class MonbanConfig {
    primalClasses: Set<string> = new Set<string>();
    uriWhitelist: UriWhitelist = new UriWhitelist();
}