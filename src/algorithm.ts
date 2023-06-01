/* eslint-disable security/detect-object-injection */

import { Query, Searchable } from "./text";

export interface AlgorithmResponse {
  readonly score: number | undefined;
}

export function algorithm(
  query: Query,
  searchable: Searchable
): AlgorithmResponse | undefined {
  const matchesSimple: number[] = Array.from({
    length: query.codePoints.length,
  });

  let queryIndex = 0; // where we at
  let queryCodePoint = query.codePoints[queryIndex];
  for (const [
    searchableIndex,
    searchableCodePoint,
  ] of searchable.codePoints.entries()) {
    if (queryCodePoint === searchableCodePoint) {
      matchesSimple[queryIndex] = searchableIndex;
      queryIndex += 1;
      queryCodePoint = query.codePoints[queryIndex];
      if (queryCodePoint === undefined) {
        // We've found a match for all code points in the query
        break;
      }
    }
  }

  if (queryIndex < query.codePoints.length) {
    // We haven't found a match for all code points in the query in the same
    // order, so this searchable doesn't contain a match (even fuzzy!)
    return;
  }

  return {
    score: 0,
  };
}
