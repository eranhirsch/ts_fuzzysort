import { digest } from "./digest";

describe("encoding uniqueness", () => {
  test("each character is a different code", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz")).toBe(26);
  });

  test("all digits have the same code", () => {
    expect(uniqueEncodedValuesCount("0123456789")).toBe(1);
  });

  test("all ascii symbols have the same code", () => {
    expect(uniqueEncodedValuesCount("`~!@#$%^&*()_+-=[]{}\\|;:'\",<.>/?")).toBe(
      1
    );
  });

  test("all emojis have the same code", () => {
    expect(uniqueEncodedValuesCount("💩🦄")).toBe(1);
  });

  test("characters and digits are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz0")).toBe(27);
  });

  test("characters and ascii symbols are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz?")).toBe(27);
  });

  test("characters and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz💩")).toBe(27);
  });

  test("digits and ascii symbols are disjoint", () => {
    expect(uniqueEncodedValuesCount("0?")).toBe(2);
  });

  test("digits and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("0💩")).toBe(2);
  });

  test("ascii symbols and emojis are disjoint", () => {
    expect(uniqueEncodedValuesCount("#💩")).toBe(2);
  });
});

const uniqueEncodedValuesCount = (characters: string) =>
  new Set([...characters].map((character) => digest(character))).size;
