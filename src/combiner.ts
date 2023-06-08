import { AlgorithmResponse } from "./algorithm";

export function maxCombiner(
  results: readonly AlgorithmResponse[]
): number | undefined {
  let max: number | undefined;
  for (const { score } of results) {
    if (max === undefined || max < score) {
      max = score;
    }
  }
  return max;
}
