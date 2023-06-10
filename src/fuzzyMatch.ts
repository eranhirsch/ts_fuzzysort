/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { findWordPrefixes } from "./findWordPrefixes";
import { indicesOf } from "./utils/indicesOf";
import { matchScore } from "./score";
import { nextWordBreakIndices } from "./wordBreaks";

export interface FuzzyMatch {
  readonly score: number;
  readonly indices: readonly number[];
}

export function fuzzyMatch(
  query: readonly string[],
  text: string
): FuzzyMatch | undefined {
  const searchable = [...text.toLowerCase()];
  const matchSequence = indicesOf(query, searchable);
  if (matchSequence === undefined) {
    return;
  }

  const nextWordBreak = nextWordBreakIndices(text);

  const wordPrefixesMatchSequence = findWordPrefixes(
    query,
    searchable,
    nextWordBreak,
    matchSequence[0]!
  );

  const indices = wordPrefixesMatchSequence ?? matchSequence;

  const score = matchScore(
    query,
    searchable,
    indices,
    wordPrefixesMatchSequence !== undefined,
    nextWordBreak
  );

  return { score, indices };
}
