/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable security/detect-object-injection */

import { Query, Searchable } from "./text";

const PENALTY_MATCH_GROUPS = 12;
const PENALTY_FIRST_MATCHING_OFFSET = 0.2;

const NON_STRICT_MATCH_FACTOR = 1000;

const LONG_PHRASES_THRESHOLD = 24;
const LONG_PHRASES_PENALTY = 10;

export function matchScore(
  query: Query,
  searchable: Searchable,
  matchSequence: readonly number[],
  isStrict: boolean,
  nextWordBreak: readonly number[]
): number {
  let score = 0;

  let extraMatchGroupCount = 0;
  for (let index = 1; index < matchSequence.length; index += 1) {
    if (matchSequence[index]! !== matchSequence[index - 1]! + 1) {
      score -= matchSequence[index]!;
      ++extraMatchGroupCount;
    }
  }

  const firstMatchingIndex = matchSequence[0]!;

  const unmatchedDistance =
    matchSequence[query.codePoints.length - 1]! -
    firstMatchingIndex -
    (query.codePoints.length - 1);

  // penalty for more groups
  score -= (PENALTY_MATCH_GROUPS + unmatchedDistance) * extraMatchGroupCount;

  if (firstMatchingIndex !== 0) {
    // penalty for not starting near the beginning
    score -=
      firstMatchingIndex * firstMatchingIndex * PENALTY_FIRST_MATCHING_OFFSET;
  }

  if (isStrict) {
    // successStrict on a target with too many beginning indexes loses points
    // for being a bad target
    let words = 1;
    for (
      let index = nextWordBreak[0]!;
      index < searchable.codePoints.length;
      index = nextWordBreak[index]!
    ) {
      words += 1;
    }

    if (words > LONG_PHRASES_THRESHOLD) {
      // quite arbitrary numbers here ...
      score *= (words - LONG_PHRASES_THRESHOLD) * LONG_PHRASES_PENALTY;
    }
  } else {
    score *= NON_STRICT_MATCH_FACTOR;
  }

  if (searchable.lowerCase.startsWith(query.lowerCase, firstMatchingIndex)) {
    // bonus for being a full substring
    score /= 1 + query.codePoints.length * query.codePoints.length * 1;

    if (
      firstMatchingIndex === 0 ||
      nextWordBreak[firstMatchingIndex - 1] === firstMatchingIndex
    ) {
      // bonus for substring starting on a beginningIndex
      score /= 1 + query.codePoints.length * query.codePoints.length * 1;
    }
  }

  // penalty for longer targets
  score -= searchable.codePoints.length - query.codePoints.length;

  return score;
}
