import { AlgorithmResponse, algorithm } from "./algorithm";
import { splitArray } from "./utils/splitArray";
import { maxCombiner } from "./combiner";
import { digest } from "./digest";

type NonEmptyArray<T> = readonly [T, ...T[]];

type Extractor<T> = (entity: T) => string | undefined;

interface Result<T> {
  readonly entity: T;
  readonly score: number;
}

const WORDS_SEPARATOR = " ";

export function goStrings(
  rawQuery: string,
  entities: Iterable<string>
): readonly string[] {
  const query = [...rawQuery.trim().toLowerCase()];
  const words = splitArray(query, WORDS_SEPARATOR);
  const queryBitMap = digest(rawQuery);

  const results: Result<string>[] = [];

  for (const entity of entities) {
    const bitmap = digest(entity);

    if ((queryBitMap & bitmap) !== queryBitMap) {
      // The query has characters which are not in the extracted string
      continue;
    }

    const result = algorithm(query, entity, words);
    if (result !== undefined) {
      results.push({ entity, score: result.score });
    }
  }

  results.sort(({ score: a }, { score: b }) => b - a);
  return results.map(({ entity }) => entity);
}

export function go<T>(
  rawQuery: string,
  entities: Iterable<T>,
  extractors: NonEmptyArray<Extractor<T>>
): T[] {
  const query = [...rawQuery.trim().toLowerCase()];
  const queryBitMap = digest(rawQuery);

  const results: Result<T>[] = [];

  for (const entity of entities) {
    const score =
      extractors.length > 1
        ? multiExtractor(entity, query, queryBitMap, extractors)
        : runOnExtractor(entity, query, queryBitMap, extractors[0])?.score;

    if (score !== undefined) {
      results.push({ entity, score });
    }
  }

  results.sort(({ score: a }, { score: b }) => b - a);
  return results.map(({ entity }) => entity);
}

function multiExtractor<T>(
  entity: T,
  query: readonly string[],
  queryBitMap: number,
  extractors: NonEmptyArray<Extractor<T>>
): number | undefined {
  const extractorResults: AlgorithmResponse[] = [];
  for (const extractor of extractors) {
    const extractorResult = runOnExtractor(
      entity,
      query,
      queryBitMap,
      extractor
    );
    if (extractorResult !== undefined) {
      extractorResults.push(extractorResult);
    }
  }
  return maxCombiner(extractorResults);
}

function runOnExtractor<T>(
  entity: T,
  query: readonly string[],
  queryBitMap: number,
  extractor: Extractor<T>
): AlgorithmResponse | undefined {
  const extracted = extractor(entity);
  if (extracted === undefined) {
    // This extractor is irrelevant for this entity
    return;
  }

  const bitmap = digest(extracted);

  if ((queryBitMap & bitmap) !== queryBitMap) {
    // The query has characters which are not in the extracted string
    return;
  }

  return algorithm(query, extracted);
}
