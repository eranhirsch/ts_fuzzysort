import { findConsecutiveSequence, findSequence } from "./sequence";
import { Query, Searchable } from "./text";

export const MAX_BACKTRACK_ATTEMPTS = 200;

export interface AlgorithmResponse {
  readonly score: number | undefined;
}

export function algorithm(
  query: Query,
  searchable: Searchable
): AlgorithmResponse | undefined {
  const simpleMatchSequence = findSequence(
    query.codePoints,
    searchable.codePoints
  );
  if (simpleMatchSequence === undefined) {
    return;
  }

  findConsecutiveSequence(
    query.codePoints,
    searchable.codePoints,
    searchable.raw,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    simpleMatchSequence[0]!
  );

  return {
    score: 0,
  };
}
