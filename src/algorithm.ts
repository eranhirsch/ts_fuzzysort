/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { findWordPrefixes } from "./findWordPrefixes";
import { indicesOf } from "./utils/indicesOf";
import { matchScore } from "./score";
import { nextWordBreakIndices } from "./wordBreaks";

export interface AlgorithmResponse {
  readonly score: number;
  readonly matchingIndices: readonly number[];
}

export function algorithm(
  query: readonly string[],
  text: string,
  words: readonly (readonly string[])[] = []
): AlgorithmResponse | undefined {
  if (words.length > 1) {
    return multiWordAlgorithm(query, text, words);
  }

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

  const matchingIndices = wordPrefixesMatchSequence ?? matchSequence;

  const score = matchScore(
    query,
    searchable,
    matchingIndices,
    wordPrefixesMatchSequence !== undefined,
    nextWordBreak
  );

  return { score, matchingIndices };
}

function multiWordAlgorithm(
  query: readonly string[],
  text: string,
  words: readonly (readonly string[])[]
): AlgorithmResponse | undefined {
  const seenIndices = new Set<number>();
  let score = 0;

  let firstSeenIndexLastSearch = 0;
  for (const word of words) {
    const result = algorithm(word, text);
    if (result === undefined) {
      return;
    }

    score += result.score;

    // dock points based on order otherwise "c man" returns Manifest.cpp instead of CheatManager.h
    const firstIndex = result.matchingIndices[0]!;
    if (firstIndex < firstSeenIndexLastSearch) {
      score -= firstSeenIndexLastSearch - firstIndex;
    }
    firstSeenIndexLastSearch = firstIndex;

    for (const matchingIndex of result.matchingIndices) {
      seenIndices.add(matchingIndex);
    }
  }

  // allows a search with spaces that's an exact substring to score well
  const fullTextResults = algorithm(query, text);
  if (fullTextResults !== undefined && fullTextResults.score > score) {
    return fullTextResults;
  }

  return { score, matchingIndices: [...seenIndices] };
}
