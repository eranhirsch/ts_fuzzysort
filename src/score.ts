/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable security/detect-object-injection */

import { Query, Searchable } from "./text";

const PENALTY_MATCH_GROUPS = 12;
const PENALTY_FIRST_MATCHING_OFFSET = 0.2;

const PENALTY_NON_STRICT_MATCH = 1000;

const LONG_PHRASES_THRESHOLD = 24;
const LONG_PHRASES_PENALTY = 10;

export function matchScore(
  query: Omit<Query, "presentCharacters">,
  searchable: Searchable,
  match: readonly number[],
  isStrict: boolean,
  nextWordBreak: readonly number[]
): number {
  let score = 0;

  score -= multiGroupPenalty(match, query.codePoints.length);

  score -= offsetPenalty(match);

  score *= isStrict ? phrasesPenalty(nextWordBreak) : PENALTY_NON_STRICT_MATCH;

  score /= substringBonus(query, searchable, match, nextWordBreak);

  // penalty for longer targets
  score -= searchable.codePoints.length - query.codePoints.length;

  return score;
}

// penalty for more groups
function multiGroupPenalty(
  match: readonly number[],
  queryLength: number
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
    match[queryLength - 1]! - match[0]! - (queryLength - 1);

  const distancePenalty =
    (PENALTY_MATCH_GROUPS + unmatchedDistance) * extraMatchGroupCount;

  return groupPositionPenalty + distancePenalty;
}

// penalty for not starting near the beginning
function offsetPenalty(match: readonly number[]): number {
  const firstMatchingIndex = match[0]!;

  if (firstMatchingIndex === 0) {
    return 0;
  }

  return (
    firstMatchingIndex * firstMatchingIndex * PENALTY_FIRST_MATCHING_OFFSET
  );
}

// successStrict on a target with too many beginning indexes loses points
// for being a bad target
function phrasesPenalty(nextWordBreak: readonly number[]): number {
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
  query: Omit<Query, "presentCharacters">,
  searchable: Searchable,
  match: readonly number[],
  nextWordBreak: readonly number[]
): number {
  const firstMatchingIndex = match[0]!;
  if (!searchable.lowerCase.startsWith(query.lowerCase, firstMatchingIndex)) {
    return 1;
  }

  // bonus for being a full substring
  const bonus = 1 + query.codePoints.length * query.codePoints.length * 1;

  if (
    firstMatchingIndex === 0 ||
    nextWordBreak[firstMatchingIndex - 1] === firstMatchingIndex
  ) {
    return bonus;
  }
  // bonus for substring starting on a beginningIndex

  return bonus * (1 + query.codePoints.length * query.codePoints.length * 1);
}
