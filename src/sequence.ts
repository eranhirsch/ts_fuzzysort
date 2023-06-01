/* eslint-disable security/detect-object-injection */

import { nextWordBreakIndices } from "./wordBreaks";
import { MAX_BACKTRACK_ATTEMPTS } from "./algorithm";

export function findSequence(
  query: readonly number[],
  searchable: readonly number[]
): readonly number[] | undefined {
  const output: number[] = Array.from({
    length: query.length,
  });

  let queryIndex = 0; // where we at
  let queryCodePoint = query[queryIndex];

  for (const [searchableIndex, searchableCodePoint] of searchable.entries()) {
    if (queryCodePoint === searchableCodePoint) {
      output[queryIndex] = searchableIndex;
      queryIndex += 1;
      queryCodePoint = query[queryIndex];
      if (queryCodePoint === undefined) {
        // We've found a match for all code points in the query
        break;
      }
    }
  }

  return queryIndex === query.length
    ? output
    : // We haven't found a match for all code points in the query in the same

      // order, so this searchable doesn't contain a match (even fuzzy!)
      undefined;
}

export function findConsecutiveSequence(
  query: readonly number[],
  searchable: readonly number[],
  searchableRaw: string,
  firstMatchingIndex: number
): readonly number[] | undefined {
  const nextWordBreak = nextWordBreakIndices(searchableRaw);

  let searchableIndex =
    firstMatchingIndex === 0
      ? 0
      : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        nextWordBreak[firstMatchingIndex - 1]!;

  if (searchableIndex >= searchable.length) {
    // The whole match is already part of the last (or only) word.
    return;
  }

  const output: number[] = [];

  // Our target string successfully matched all characters in sequence!
  // Let's try a more advanced and strict test to improve the score
  // only count it as a match if it's consecutive or a beginning character!
  let backtrackAttempts = 0;
  while (output.length < query.length) {
    if (query[output.length] === searchable[searchableIndex]) {
      output.push(searchableIndex);
      searchableIndex += 1;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      searchableIndex = nextWordBreak[searchableIndex]!;
      if (searchableIndex >= searchable.length) {
        // We failed to find a good spot for this search char, go back to the previous search char and force it forward
        backtrackAttempts += 1;
        if (backtrackAttempts > MAX_BACKTRACK_ATTEMPTS) {
          // exponential backtracking is taking too long, just give up and
          // return a bad match
          break;
        }

        // We pop the last match from the result and ignore it, skipping to the
        // next word and trying to match it again
        const lastMatch = output.pop();
        if (lastMatch === undefined) {
          // This should be impossible, it means that we haven't even found the
          // match that we found with findSequence. We should probably throw
          // here...
          break;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        searchableIndex = nextWordBreak[lastMatch]!;
      }
    }
  }

  return output.length === query.length ? output : undefined;
}
