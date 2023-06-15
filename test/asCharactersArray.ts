import { type NonEmptyArray } from "../src/utils/isNonEmpty";

export function asCharactersArray(raw: ""): readonly [];
export function asCharactersArray(raw: string): NonEmptyArray<string>;
export function asCharactersArray(raw: string): readonly string[] {
  return [...raw.toLowerCase()];
}
