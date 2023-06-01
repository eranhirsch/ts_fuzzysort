import { matchScore } from "./score";
import { findSimpleSequence, findStrictSequence } from "./sequence";
import { Query, Searchable } from "./text";
import { nextWordBreakIndices } from "./wordBreaks";

export interface AlgorithmResponse {
  readonly score: number | undefined;
}

export function algorithm(
  query: Query,
  searchable: Searchable
): AlgorithmResponse | undefined {
  const simpleMatchSequence = findSimpleSequence(
    query.codePoints,
    searchable.codePoints
  );
  if (simpleMatchSequence === undefined) {
    return;
  }

  const nextWordBreak = nextWordBreakIndices(searchable.raw);

  const strictMatchSequence = findStrictSequence(
    query.codePoints,
    searchable.codePoints,
    nextWordBreak,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    simpleMatchSequence[0]!
  );

  const score = matchScore(
    query,
    searchable,
    strictMatchSequence ?? simpleMatchSequence,
    strictMatchSequence !== undefined,
    nextWordBreak
  );

  return { score };
}
