/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { FuzzyMatch, fuzzyMatch } from "./fuzzyMatch";

export function fuzzyMatchWords(
  words: readonly (readonly string[])[],
  query: readonly string[],
  text: string
): FuzzyMatch | undefined {
  const seenIndices = new Set<number>();
  let score = 0;

  let firstSeenIndexLastSearch = 0;
  for (const word of words) {
    const result = fuzzyMatch(word, text);
    if (result === undefined) {
      return;
    }

    score += result.score;

    // dock points based on order otherwise "c man" returns Manifest.cpp instead of CheatManager.h
    const firstIndex = result.indices[0]!;
    if (firstIndex < firstSeenIndexLastSearch) {
      score -= firstSeenIndexLastSearch - firstIndex;
    }
    firstSeenIndexLastSearch = firstIndex;

    for (const matchingIndex of result.indices) {
      seenIndices.add(matchingIndex);
    }
  }

  // allows a search with spaces that's an exact substring to score well
  const fullTextResults = fuzzyMatch(query, text);
  if (fullTextResults !== undefined && fullTextResults.score > score) {
    return fullTextResults;
  }

  return { score, indices: [...seenIndices] };
}
