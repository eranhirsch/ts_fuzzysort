import { findWordBreakIndices, nextWordBreakIndices } from "./wordBreaks";

describe("nextWordBreakIndices", () => {
  test("empty string", () => {
    const term = "";
    expect(findBreaks(term)).toEqual([]);
    expect(nextWordBreakIndices(term)).toEqual([]);
  });

  test("simple word", () => {
    const term = "hello";
    expect(findBreaks(term)).toEqual([]);
    expect(nextWordBreakIndices(term)).toEqual([5, 5, 5, 5, 5]);
  });

  test("several lowercase words with spaces", () => {
    const term = "hello world this works";
    expect(findBreaks(term)).toEqual([5, 6, 11, 12, 16, 17]);
    expect(nextWordBreakIndices(term)).toEqual([
      5, 5, 5, 5, 5, 6, 11, 11, 11, 11, 11, 12, 16, 16, 16, 16, 17, 22, 22, 22,
      22, 22,
    ]);
  });

  test("several upper case words with spaces", () => {
    const term = "HELLO WORLD THIS WORKS";
    expect(findBreaks(term)).toEqual([5, 6, 11, 12, 16, 17]);
    expect(nextWordBreakIndices(term)).toEqual([
      5, 5, 5, 5, 5, 6, 11, 11, 11, 11, 11, 12, 16, 16, 16, 16, 17, 22, 22, 22,
      22, 22,
    ]);
  });

  test("camelCased", () => {
    const term = "helloWorldThisWorks";
    expect(findBreaks(term)).toEqual([5, 10, 14]);
    expect(nextWordBreakIndices(term)).toEqual([
      5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 14, 14, 14, 14, 19, 19, 19, 19, 19,
    ]);
  });

  test("snake_cased", () => {
    const term = "hello_world_this_works";
    expect(findBreaks(term)).toEqual([5, 6, 11, 12, 16, 17]);
    expect(nextWordBreakIndices(term)).toEqual([
      5, 5, 5, 5, 5, 6, 11, 11, 11, 11, 11, 12, 16, 16, 16, 16, 17, 22, 22, 22,
      22, 22,
    ]);
  });

  test("ALL CAPS", () => {
    const term = "HELLOWORLDTHISWORKS";
    expect(findBreaks(term)).toEqual([]);
    expect(nextWordBreakIndices(term)).toEqual([
      19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19,
      19,
    ]);
  });

  test("emojis", () => {
    const term = "👋🌍🤖";
    expect(findBreaks(term)).toEqual([1, 2]);
    expect(nextWordBreakIndices(term)).toEqual([1, 2, 3]);
  });
});

const findBreaks = (input: string): readonly number[] => [
  ...findWordBreakIndices([...input]),
];
