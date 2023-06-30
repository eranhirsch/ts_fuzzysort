import { digest } from "./digest";

describe("sanity", () => {
  test("empty", () => {
    expect(digest("")).toBe(0);
  });

  test("spaces", () => {
    expect(digest("          ")).toBe(0);
  });

  test("characters", () => {
    expect(digest("abcd")).toBe(0xf);
  });

  test("digits", () => {
    expect(digest("0123")).toBe(0x4_00_00_00);
  });

  test("ascii", () => {
    expect(digest("&@*#")).toBe(0x8_00_00_00);
  });

  test("emojis", () => {
    expect(digest("💩🦄")).toBe(0x10_00_00_00);
  });

  test("all", () => {
    expect(digest("abcdefghijklmnopqrstuvwxyz0=🦄")).toBe(0x1f_ff_ff_ff);
  });
});

test("space doesn't matter", () => {
  expect(digest("a 0 % 🦄")).toBe(digest("a0%🦄"));
});

describe("encoding uniqueness", () => {
  test("each character is a different code", () => {
    expect(uniqueEncodedValuesCount("abcdefghijklmnopqrstuvwxyz")).toBe(26);
  });

  test("all digits have the same code", () => {
    expect(uniqueEncodedValuesCount("0123456789")).toBe(1);
  });

  test("all ascii symbols have the same code", () => {
    expect(uniqueEncodedValuesCount("`~!@#$%^&*()_+-=[]{}\\|;:'\",<.>/?")).toBe(
      1,
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

  test.each([..."abcdefghijklmnopqrstuvwxyz"])(
    "upper case has same code (%s)",
    (character) => {
      expect(
        uniqueEncodedValuesCount(
          `${character.toLowerCase()}${character.toUpperCase()}`,
        ),
      ).toBe(1);
    },
  );
});

const uniqueEncodedValuesCount = (characters: string) =>
  new Set([...characters].map((character) => digest(character))).size;
