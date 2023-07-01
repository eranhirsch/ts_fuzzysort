import { asCharactersArray } from "../test/asCharactersArray";

const WORDS_SPLITTER = / +/g;

export const queryWords = (query: string) =>
  query.split(WORDS_SPLITTER).map((word) => ({
    characters: asCharactersArray(word),
    lowercase: word,
  }));
