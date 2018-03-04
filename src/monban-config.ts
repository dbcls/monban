import { UriWhitelist } from "./uri-whitelist";

export class MonbanConfig {
    PrimalClasses: Set<string> = new Set<string>();
    UriWhitelist: UriWhitelist = new UriWhitelist();
}