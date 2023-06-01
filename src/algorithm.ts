/* eslint-disable security/detect-object-injection */

import { Query, Searchable } from "./text";

export interface AlgorithmResponse {
  readonly score: number | undefined;
}

export function algorithm(
  query: Query,
  searchable: Searchable
): AlgorithmResponse | undefined {
  const matchesSimple: number[] = Array.from({
    length: query.codePoints.length,
  });

  let queryIndex = 0; // where we at
  let queryCodePoint = query.codePoints[queryIndex];
  for (const [
    searchableIndex,
    searchableCodePoint,
  ] of searchable.codePoints.entries()) {
    if (queryCodePoint === searchableCodePoint) {
      matchesSimple[queryIndex] = searchableIndex;
      queryIndex += 1;
      queryCodePoint = query.codePoints[queryIndex];
      if (queryCodePoint === undefined) {
        // We've found a match for all code points in the query
        break;
      }
    }
  }

  if (queryIndex < query.codePoints.length) {
    // We haven't found a match for all code points in the query in the same
    // order, so this searchable doesn't contain a match (even fuzzy!)
    return;
  }

  return {
    score: 0,
  };
}

// // ChatGPT

// interface Prepared {
//   _lower: string;
//   lowerCodes: number[];
//   _targetLowerCodes: number[];
//   _nextBeginningIndexes: number[];
//   _targetLower: string;
//   score: number;
//   _indexes: number[];
// }

// const algorithm = (
//   preparedSearch: Prepared,
//   prepared: Prepared,
//   allowSpaces = false
// ): Prepared => {
//   const { _lower: searchLower, lowerCodes: searchLowerCodes } = preparedSearch;
//   const { _targetLowerCodes: targetLowerCodes } = prepared;
//   const searchLen = searchLowerCodes.length;
//   const targetLen = targetLowerCodes.length;

//   let searchI = 0;
//   let targetI = 0;
//   let matchesSimpleLen = 0;
//   const matchesSimple: number[] = [];

//   // Very basic fuzzy match; to remove non-matching targets ASAP!
//   // Walk through target. Find sequential matches.
//   // If all chars aren't found, then exit
//   for (;;) {
//     const searchLowerCode = searchLowerCodes[searchI];
//     const isMatch = searchLowerCode === targetLowerCodes[targetI];
//     if (isMatch) {
//       matchesSimple[matchesSimpleLen++] = targetI;
//       ++searchI;
//       if (searchI === searchLen) break;
//     }
//     ++targetI;
//     if (targetI >= targetLen) return null; // Failed to find searchI
//   }

//   let successStrict = false;
//   let matchesStrictLen = 0;
//   let nextBeginningIndexes = prepared._nextBeginningIndexes;
//   if (!nextBeginningIndexes) {
//     nextBeginningIndexes = prepared._nextBeginningIndexes =
//       prepareNextBeginningIndexes(prepared._targetLower);
//   }
//   const firstPossibleI =
//     matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];

//   // Our target string successfully matched all characters in sequence!
//   // Let's try a more advanced and strict test to improve the score
//   // Only count it as a match if it's consecutive or a beginning character!
//   let backtrackCount = 0;
//   if (targetI !== targetLen) {
//     for (;;) {
//       if (targetI >= targetLen) {
//         // We failed to find a good spot for this search char, go back to the previous search char and force it forward
//         if (searchI <= 0) break; // We failed to push chars forward for a better match

//         ++backtrackCount;
//         if (backtrackCount > 200) break; // Exponential backtracking is taking too long, just give up and return a bad match

//         --searchI;
//         const lastMatch = matchesStrict[--matchesStrictLen];
//         targetI = nextBeginningIndexes[lastMatch];
//       } else {
//         const isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
//         if (isMatch) {
//           matchesStrict[matchesStrictLen++] = targetI;
//           ++searchI;
//           if (searchI === searchLen) {
//             successStrict = true;
//             break;
//           }
//           ++targetI;
//         } else {
//           targetI = nextBeginningIndexes[targetI];
//         }
//       }
//     }
//   }

//   // Check if it's a substring match
//   const substringIndex = prepared._targetLower.indexOf(
//     searchLower,
//     matchesSimple[0]
//   );
//   const isSubstring = substringIndex !== -1;
//   if (isSubstring && !successStrict) {
//     // Rewrite the indexes from basic to the substring
//     matchesSimple
//       .fill(0)
//       .map((_, i) => (matchesSimple[i] = substringIndex + i));
//   }
//   const isSubstringBeginning =
//     isSubstring &&
//     prepared._nextBeginningIndexes[substringIndex - 1] === substringIndex;

//   // Tally up the score & keep track of matches for highlighting later
//   const matchesBest = successStrict ? matchesStrict : matchesSimple;
//   const matchesBestLen = matchesBest.length;

//   let score = 0;
//   let extraMatchGroupCount = 0;
//   for (let i = 1; i < searchLen; ++i) {
//     if (matchesBest[i] - matchesBest[i - 1] !== 1) {
//       score -= matchesBest[i];
//       ++extraMatchGroupCount;
//     }
//   }
//   const unmatchedDistance =
//     matchesBest[searchLen - 1] - matchesBest[0] - (searchLen - 1);

//   score -= (12 + unmatchedDistance) * extraMatchGroupCount; // Penalty for more groups

//   if (matchesBest[0] !== 0) score -= matchesBest[0] ** 2 * 0.2; // Penalty for not starting near the beginning

//   if (!successStrict) {
//     score *= 1000;
//   } else {
//     // successStrict on a target with too many beginning indexes loses points for being a bad target
//     let uniqueBeginningIndexes = 1;
//     for (
//       let i = nextBeginningIndexes[0];
//       i < targetLen;
//       i = nextBeginningIndexes[i]
//     )
//       ++uniqueBeginningIndexes;

//     if (uniqueBeginningIndexes > 24)
//       score *= (uniqueBeginningIndexes - 24) * 10; // Arbitrary numbers here...
//   }

//   if (isSubstring) score /= 1 + searchLen ** 2 * 1; // Bonus for being a full substring
//   if (isSubstringBeginning) score /= 1 + searchLen ** 2 * 1; // Bonus for substring starting on a beginningIndex

//   score -= targetLen - searchLen; // Penalty for longer targets
//   prepared.score = score;

//   prepared._indexes = matchesBest;
//   return prepared;
// };

// // Helper function
// const prepareNextBeginningIndexes = (target: string): number[] => {
//   const nextBeginningIndexes = [];
//   let prevIndex = -1;
//   for (let i = 0; i < target.length; i++) {
//     if (target[i] === " ") {
//       nextBeginningIndexes[prevIndex] = i;
//       prevIndex = i;
//     }
//   }
//   nextBeginningIndexes[prevIndex] = target.length; // Sentinel value
//   return nextBeginningIndexes;
// };
