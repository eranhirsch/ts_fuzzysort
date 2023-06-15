import { digest } from "./digest";
import { fuzzyMatch, type FuzzyMatch } from "./fuzzyMatch";
import { fuzzyMatchWords } from "./fuzzyMatchWords";
import { isNonEmpty, type NonEmptyArray } from "./utils/isNonEmpty";
import { splitArray } from "./utils/splitArray";

interface Result<T> {
  readonly entity: T;
  readonly match: FuzzyMatch;
}

const WORDS_SEPARATOR = " ";

export function find<T>(
  rawQuery: string,
  entities: Iterable<T>,
  extractor: (entity: T) => string
): readonly T[] {
  const query = [...rawQuery.trim().toLowerCase()];

  if (!isNonEmpty(query)) {
    // TODO [2024-01-01]: Technically find is a filter that returns *less*
    // results the more characters the query has, so when the query is empty it
    // should return everything, not nothing...
    return [];
  }

  const words = splitArray(query, WORDS_SEPARATOR);
  const queryDigest = digest(rawQuery);

  const results: Result<T>[] = [];

  // TODO [2024-01-01]: We extract this condition check to avoid having to check
  // the constant words array on every iteration, but it might actually be more
  // expensive because of the extra arrow function required, so we need to
  // benchmark this and pick the better option.
  const matchFunction =
    words.length === 1
      ? fuzzyMatch
      : (query: NonEmptyArray<string>, text: string) =>
          fuzzyMatchWords(words, query, text);

  for (const entity of entities) {
    const text = extractor(entity);
    const entityDigest = digest(text);

    // This checks if all bits in the queryDigest are enabled in the
    // entityDigest. We don't extract this to a function to not incur a function
    // call for each check.
    if ((queryDigest & entityDigest) !== queryDigest) {
      // The entity doesn't contain all characters needed by query so we can
      // skip it without running a full text scan on it.
      continue;
    }

    const match = matchFunction(query, text);
    if (match !== undefined) {
      results.push({ entity, match });
    }
  }

  results.sort(({ match: { score: a } }, { match: { score: b } }) => b - a);
  return results.map(({ entity }) => entity);
}
