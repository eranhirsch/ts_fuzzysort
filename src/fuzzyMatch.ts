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

export interface FuzzyMatchQuery {
  readonly characters: NonEmptyArray<string>;
  readonly lowercase: string;
}

export function fuzzyMatch(
  query: FuzzyMatchQuery,
  textRaw: string,
): FuzzyMatch | undefined {
  const textLowercase = textRaw.toLowerCase();

  // Check if the query is a substring of the text.
  const substringIndex = textLowercase.indexOf(query.lowercase);
  // Build a sequence starting from the index we found the substring match at.
  const substringSequence =
    substringIndex === -1
      ? undefined
      : // @ts-expect-error [ts2352] - We should be able to make the types work better here but I don't want to add anything at runtime (including a function call) and hit perf.
        (Array.from({ length: query.lowercase.length }).map(
          (_, index) => index + substringIndex,
        ) as NonEmptyArray<number>);

  const text = [...textLowercase];

  // If we didn't find a substring, look for any sequence of the query inside
  // the text, even if it isn't a substring.
  const matchSequence = substringSequence ?? indicesOf(query.characters, text);

  if (matchSequence === undefined) {
    // The query doesn't match the text at all.
    return;
  }

  const nextWordBreak = nextWordBreakIndices(textRaw);

  const wordPrefixesMatchSequence = findWordPrefixes(
    query.characters,
    text,
    nextWordBreak,
    matchSequence[0]!,
  );

  const indices = wordPrefixesMatchSequence ?? matchSequence;

  const score = matchScore(
    query.characters,
    text,
    indices,
    wordPrefixesMatchSequence !== undefined,
    substringSequence !== undefined,
    nextWordBreak,
  );

  return { score, indices };
}
