/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { matchScore } from "./score";
import { findSimpleSequence, findStrictSequence } from "./sequence";
import { Query, Searchable } from "./text";
import { nextWordBreakIndices } from "./wordBreaks";

export interface AlgorithmResponse {
  readonly score: number;
  readonly matchingIndices: readonly number[];
}

export function algorithm(
  query: Omit<Query, "presentCharacters">,
  searchable: Searchable,
  isFullTextOnly = false
): AlgorithmResponse | undefined {
  if (!isFullTextOnly && query.words !== undefined) {
    return multiWordAlgorithm(query, searchable, query.words);
  }

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

    simpleMatchSequence[0]!
  );

  const matchingIndices = strictMatchSequence ?? simpleMatchSequence;

  const score = matchScore(
    query,
    searchable,
    matchingIndices,
    strictMatchSequence !== undefined,
    nextWordBreak
  );

  return { score, matchingIndices };
}

function multiWordAlgorithm(
  fullText: Omit<Query, "presentCharacters">,
  searchable: Searchable,
  words: readonly Omit<Query, "presentCharacters">[]
): AlgorithmResponse | undefined {
  const seenIndices = new Set<number>();
  let score = 0;

  let firstSeenIndexLastSearch = 0;
  for (const word of words) {
    const result = algorithm(word, searchable);
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
  const fullTextResults = algorithm(
    fullText,
    searchable,
    true /* isFullTextOnly */
  );
  if (fullTextResults !== undefined && fullTextResults.score > score) {
    return fullTextResults;
  }

  return { score, matchingIndices: [...seenIndices] };
}
