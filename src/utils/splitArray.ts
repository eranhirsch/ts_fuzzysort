import { NonEmptyArray, isNonEmpty } from "./isNonEmpty";

type Split<T> = NonEmptyArray<T>[];

/**
 * Splits the array similar to `String.prototype.split` but for arrays, but
 * treats consecutive separators as a single separator.
 *
 * @param data The array to split.
 * @param separator The separator to split on.
 * @returns
 */
export function splitArray<T>(data: readonly T[], separator: T): Split<T> {
  const parts: Split<T> = [];

  let lastSpace = -1;
  for (const [index, character] of data.entries()) {
    if (character === separator) {
      // We skip consecutive spaces
      if (lastSpace < index - 1) {
        parts.push(nonEmptySlice(data, lastSpace + 1, index));
      }
      lastSpace = index;
    }
  }

  if (lastSpace < data.length - 1) {
    // add the last word
    parts.push(nonEmptySlice(data, lastSpace + 1));
  }

  return parts;
}

function nonEmptySlice<T>(
  data: readonly T[],
  from: number,
  to?: number,
): NonEmptyArray<T> {
  const part = data.slice(from, to);
  if (isNonEmpty(part)) {
    return part;
  }

  throw new Error(
    `Failed to get non-empty slice from ${from} ${
      to === undefined ? "" : `to ${to} `
    }in ${JSON.stringify(data)}`,
  );
}
