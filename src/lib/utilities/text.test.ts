import { describe, expect, it } from "vitest";
import { truncateText } from "./text";

describe("truncateText", () => {
  it("returns the original text when under the max length", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
  });

  it("returns the original text when exactly at the max length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("truncates and appends an ellipsis when over the max length", () => {
    expect(truncateText("Hello, world!", 5)).toBe("Hello…");
  });

  it("trims trailing whitespace before appending the ellipsis", () => {
    expect(truncateText("Hello  world", 6)).toBe("Hello…");
  });
});
