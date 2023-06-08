import { AlgorithmResponse, algorithm } from "./algorithm";
import { maxCombiner } from "./combiner";
import { Query, createQuery, createSearchable } from "./text";
import { digest } from "./digest";

type NonEmptyArray<T> = readonly [T, ...T[]];

type Extractor<T> = (entity: T) => string | undefined;

interface Result<T> {
  readonly entity: T;
  readonly score: number;
}

export function goStrings(
  rawQuery: string,
  entities: Iterable<string>
): readonly string[] {
  const query = createQuery(rawQuery);

  const queryBitMap = digest(rawQuery);

  const results: Result<string>[] = [];

  for (const entity of entities) {
    const bitmap = digest(entity);

    if ((queryBitMap & bitmap) !== queryBitMap) {
      // The query has characters which are not in the extracted string
      continue;
    }

    const searchable = createSearchable(entity);
    const result = algorithm(query, searchable);
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
  const query = createQuery(rawQuery);

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
  query: Query,
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
  query: Query,
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

  const searchable = createSearchable(extracted);
  return algorithm(query, searchable);
}
