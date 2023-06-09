import { splitArray } from "./splitArray";

test("empty", () => {
  expect(testSplitArraySpaces("")).toEqual([]);
});

test("single word", () => {
  expect(testSplitArraySpaces("abdef")).toEqual([["a", "b", "d", "e", "f"]]);
});

test("just a space", () => {
  expect(testSplitArraySpaces(" ")).toEqual([]);
});

test("just a lot of spaces", () => {
  expect(testSplitArraySpaces("                      ")).toEqual([]);
});

test("2 words", () => {
  expect(testSplitArraySpaces("abc def")).toEqual([
    ["a", "b", "c"],
    ["d", "e", "f"],
  ]);
});

test("3 words", () => {
  expect(testSplitArraySpaces("abc def ghi")).toEqual([
    ["a", "b", "c"],
    ["d", "e", "f"],
    ["g", "h", "i"],
  ]);
});

test("more than one space between words", () => {
  expect(testSplitArraySpaces("abc     def")).toEqual([
    ["a", "b", "c"],
    ["d", "e", "f"],
  ]);
});

test("spaces at the beginning and end", () => {
  expect(testSplitArraySpaces("     abc def          ")).toEqual([
    ["a", "b", "c"],
    ["d", "e", "f"],
  ]);
});

test("single letter words", () => {
  expect(testSplitArraySpaces("a b c d e f h")).toEqual([
    ["a"],
    ["b"],
    ["c"],
    ["d"],
    ["e"],
    ["f"],
    ["h"],
  ]);
});

test("single letter words with more than one space", () => {
  expect(testSplitArraySpaces("a   b    c   d     e  f     h   ")).toEqual([
    ["a"],
    ["b"],
    ["c"],
    ["d"],
    ["e"],
    ["f"],
    ["h"],
  ]);
});

const testSplitArraySpaces = (raw: string): ReturnType<typeof splitArray> =>
  splitArray([...raw], " ");
