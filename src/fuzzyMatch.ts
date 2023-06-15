/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { findWordPrefixes } from "./findWordPrefixes";
import { matchScore } from "./score";
import { indicesOf } from "./utils/indicesOf";
import { type NonEmptyArray } from "./utils/isNonEmpty";
import { nextWordBreakIndices } from "./wordBreaks";

export interface FuzzyMatch {
  readonly score: number;
  readonly indices: readonly number[];
}

export function fuzzyMatch(
  query: NonEmptyArray<string>,
  textRaw: string
): FuzzyMatch | undefined {
  const text = [...textRaw.toLowerCase()];
  const matchSequence = indicesOf(query, text);
  if (matchSequence === undefined) {
    return;
  }

  const nextWordBreak = nextWordBreakIndices(textRaw);

  const wordPrefixesMatchSequence = findWordPrefixes(
    query,
    text,
    nextWordBreak,
    matchSequence[0]!
  );

  const indices = wordPrefixesMatchSequence ?? matchSequence;

  const score = matchScore(
    query,
    text,
    indices,
    wordPrefixesMatchSequence !== undefined,
    nextWordBreak
  );

  return { score, indices };
}
