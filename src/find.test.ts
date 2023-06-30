import { UE4_FILES, URLS_AND_TITLES } from "../test/data";
import { find } from "./find";

const identity = <T>(x: T): T => x;

// Ported from farzher/fuzzysort
describe("legacy", () => {
  test("zom in URLS_AND_TITLES", () => {
    const [firstResult] = find("zom", URLS_AND_TITLES, identity);
    expect(firstResult).toBe("jQuery Zoom");
  });

  test("cman in UE4_FILES", () => {
    const result = find("cman", UE4_FILES, identity).slice(0, 2);
    expect(result).toEqual(["CrowdManager.h", "CheatManager.h"]);
  });

  test("Non-matches are filtered out", () => {
    const result = find(
      "adio",
      ["Audio.h", "AsyncTaskDownloadImage.h"],
      identity,
    );
    expect(result).length(1);
    expect(result).not.contain("AsyncTaskDownloadImage.h");
  });

  test("substring score order", () => {
    const sortedMatches = [
      "The Amazing Spider-Man",
      "The Amazing Spider",
      "The Amazing",
      "The",
    ];
    const result = find("The Amazing Spider-Man", sortedMatches, identity);
    expect(result).toEqual(sortedMatches);
  });
});
