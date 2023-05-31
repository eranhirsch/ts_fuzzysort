import { Query, Searchable } from "./text";

export interface AlgorithmResponse {
  readonly score: number | undefined;
}

export function algorithm(
  query: Query,
  searchable: Searchable
): AlgorithmResponse {
  return {
    score: 0,
  };
}
