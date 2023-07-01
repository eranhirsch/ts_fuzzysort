/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable security/detect-object-injection */

import { type NonEmptyArray } from "./utils/isNonEmpty";

const PENALTY_MATCH_GROUPS = 12;
const PENALTY_FIRST_MATCHING_OFFSET = 0.2;

const PENALTY_NON_STRICT_MATCH = 1000;

const LONG_PHRASES_THRESHOLD = 24;
const LONG_PHRASES_PENALTY = 10;

export function matchScore(
  query: readonly string[],
  searchable: readonly string[],
  match: NonEmptyArray<number>,
  isWordStarts: boolean,
  isQuerySubstring: boolean,
  nextWordBreak: readonly number[],
): number {
  let score = 0;

  score -= multiGroupPenalty(match, query.length);

  score -= offsetPenalty(match);

  score *= isWordStarts
    ? phrasesPenalty(nextWordBreak)
    : PENALTY_NON_STRICT_MATCH;

  score /= isQuerySubstring ? substringBonus(query, match, nextWordBreak) : 1;

  // penalty for longer targets
  score -= searchable.length - query.length;

  return score;
}

// penalty for more groups
function multiGroupPenalty(
  match: NonEmptyArray<number>,
  queryLength: number,
): number {
  let groupPositionPenalty = 0;

  let extraMatchGroupCount = 0;
  for (let index = 1; index < match.length; index += 1) {
    if (match[index]! !== match[index - 1]! + 1) {
      groupPositionPenalty += match[index]!;
      ++extraMatchGroupCount;
    }
  }

  const unmatchedDistance =
    match[queryLength - 1]! - match[0] - (queryLength - 1);

  const distancePenalty =
    (PENALTY_MATCH_GROUPS + unmatchedDistance) * extraMatchGroupCount;

  return groupPositionPenalty + distancePenalty;
}

// penalty for not starting near the beginning
const offsetPenalty = ([firstMatchingIndex]: NonEmptyArray<number>): number =>
  firstMatchingIndex * firstMatchingIndex * PENALTY_FIRST_MATCHING_OFFSET;

// successStrict on a target with too many beginning indexes loses points
// for being a bad target
function phrasesPenalty(nextWordBreak: readonly number[]): number {
  // TODO [2023-09-01]: Check if using set to compute the number of unique
  // values in nextWordBreak has any impact on performance:
  // `const words = new Set(nextWordBreak).size;`
  let words = 1;
  for (
    let index = nextWordBreak[0]!;
    index < nextWordBreak.length;
    index = nextWordBreak[index]!
  ) {
    words += 1;
  }

  if (words <= LONG_PHRASES_THRESHOLD) {
    return 1;
  }

  // quite arbitrary numbers here ...
  return (words - LONG_PHRASES_THRESHOLD) * LONG_PHRASES_PENALTY;
}

function substringBonus(
  query: readonly string[],
  [firstMatchingIndex]: NonEmptyArray<number>,
  nextWordBreak: readonly number[],
): number {
  // bonus for being a full substring
  const bonus = 1 + query.length * query.length * 1;

  if (
    firstMatchingIndex === 0 ||
    nextWordBreak[firstMatchingIndex - 1] === firstMatchingIndex
  ) {
    // bonus for substring starting on a beginningIndex
    return bonus * (1 + query.length * query.length * 1);
  }

  return bonus;
}
