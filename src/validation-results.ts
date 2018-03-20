import { Error } from './error';

export class Statistics {
    elapsed: number = 0;
}

export class ValidationResults {
    path = "";
    statistics: Statistics = new Statistics();
    errors: Map<string, Set<Error>> = new Map<string, Set<Error>>();
}