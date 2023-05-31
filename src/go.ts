import { AlgorithmResponse, algorithm } from "./algorithm";
import { Query, createQuery, createSearchable } from "./text";

type NonEmptyArray<T> = readonly [T, ...T[]];

type Extractor<T> = (entity: T) => string | undefined;

type Combiner<T> = (
  entity: T,
  results: readonly AlgorithmResponse[]
) => number | undefined;

interface Result<T> {
  readonly entity: T;
  readonly score: number;
}

export function go<T>(
  rawQuery: string,
  entities: readonly T[],
  extractors: NonEmptyArray<Extractor<T>>,
  combiner: Combiner<T>
): T[] {
  const query = createQuery(rawQuery);

  const results: Result<T>[] = [];

  for (const entity of entities) {
    const score =
      extractors.length > 1
        ? multiExtractor(entity, query, extractors, combiner)
        : runOnExtractor(entity, query, extractors[0])?.score;

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
  extractors: NonEmptyArray<Extractor<T>>,
  combiner: Combiner<T>
): number | undefined {
  const extractorResults: AlgorithmResponse[] = [];
  for (const extractor of extractors) {
    const extractorResult = runOnExtractor(entity, query, extractor);
    if (extractorResult !== undefined) {
      extractorResults.push(extractorResult);
    }
  }
  return combiner(entity, extractorResults);
}

function runOnExtractor<T>(
  entity: T,
  query: Query,
  extractor: Extractor<T>
): AlgorithmResponse | undefined {
  const extracted = extractor(entity);
  if (extracted === undefined) {
    // This extractor is irrelevant for this entity
    return;
  }

  const searchable = createSearchable(extracted);
  if (
    query.presentCharacters.difference_size(searchable.presentCharacters) > 0
  ) {
    // The query has characters which are not in the extracted string
    return;
  }

  return algorithm(query, searchable);
}
