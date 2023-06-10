import { FuzzyMatch } from "./fuzzyMatch";

export function maxCombiner(
  results: readonly FuzzyMatch[]
): number | undefined {
  let max: number | undefined;
  for (const { score } of results) {
    if (max === undefined || max < score) {
      max = score;
    }
  }
  return max;
}
