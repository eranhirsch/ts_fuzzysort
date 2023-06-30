/* eslint-disable security/detect-object-injection */

import { type NonEmptyArray } from "./utils/isNonEmpty";

const MAX_BACKTRACK_ATTEMPTS = 200;

/**
 * Look for the query as a set of word prefixes in searchable.
 *
 * This function takes nextWordBreaks and firstMatchingIndex as arguments
 * instead of computing them itself for performance reasons. They are already
 * present at the caller so we don't need to run the logic twice.
 *
 * @param queryCharacters Characters of the lowercased query.
 * @param textCharacters Characters of the lowercased searchable.
 * @param nextWordBreak [Precomputed] An array of indices to the next word, for
 * each given index of searchable.
 * @param firstMatchingIndex The location of the first code point in query
 * inside searchable (the equivalent of running `searchable.indexOf(query[0])`)
 * @returns A sequence of indices that represent a projection of query on
 * searchable; or `undefined` if no such sequence exists.
 */
export function findWordPrefixes(
  // We take characters instead of a raw string because String.prototype.length
  // doesn't take multi-code point characters into account.
  queryCharacters: NonEmptyArray<string>,
  textCharacters: readonly string[],
  nextWordBreak: readonly number[],
  firstMatchingIndex: number,
): NonEmptyArray<number> | undefined {
  let index =
    firstMatchingIndex === 0 ? 0 : nextWordBreak[firstMatchingIndex - 1];

  if (index === undefined || index >= textCharacters.length) {
    // The whole match is already part of the last (or only) word.
    return;
  }

  // We use the length of output as an index into the query, so we can't create
  // a sparse array here.
  const output: number[] = [];
  let backtrackAttempts = 0;

  for (;;) {
    if (
      index !== undefined &&
      queryCharacters[output.length] === textCharacters[index]
    ) {
      // We have match within the current word
      output.push(index);
      if (output.length === queryCharacters.length) {
        // @ts-expect-error [ts2322] - Output is guaranteed to have at least 1 element, we just pushed it!
        return output;
      }

      index += 1;
      continue;
    }

    index = index === undefined ? undefined : nextWordBreak[index];
    if (index !== undefined && index < textCharacters.length) {
      // We found a mismatch in the current word so we skip to the next word
      continue;
    }

    // We've scanned the whole searchable and weren't able to match word
    // word prefixes. We can try "skipping earlier" to see if we can match
    // prefixes differently.

    backtrackAttempts += 1;
    if (backtrackAttempts > MAX_BACKTRACK_ATTEMPTS) {
      // We've attempted to many variations, let's give up so we remain quick.
      return;
    }

    // We pop the last match from the result so we can try matching it with a
    // later word in searchable.
    const lastMatch = output.pop();
    if (lastMatch === undefined) {
      // We've retried all possible variations, the query simply doesn't exist
      // as a set of word prefixes in searchable.
      return;
    }

    index = nextWordBreak[lastMatch];
  }
}
