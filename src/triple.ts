export interface Triple {
  subject: string;
  predicate: string;
  object: string;
  graph: string;
  nth: number | undefined;
}