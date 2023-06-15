export type NonEmptyArray<T> = readonly [T, ...T[]];

export const isNonEmpty = <T>(items: readonly T[]): items is NonEmptyArray<T> =>
  items.length > 0;
