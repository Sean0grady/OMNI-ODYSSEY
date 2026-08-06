import { describe, expect, it } from "vitest";
import { formatCompactNumber, getInitials } from "./number";

describe("formatCompactNumber", () => {
  it("leaves small numbers unformatted", () => {
    expect(formatCompactNumber(42)).toBe("42");
  });

  it("compacts thousands", () => {
    expect(formatCompactNumber(1500)).toBe("1.5K");
  });

  it("compacts millions", () => {
    expect(formatCompactNumber(2_400_000)).toBe("2.4M");
  });
});

describe("getInitials", () => {
  it("returns empty string for blank input", () => {
    expect(getInitials("   ")).toBe("");
  });

  it("takes the first two characters of a single-word name", () => {
    expect(getInitials("Marcus")).toBe("MA");
  });

  it("takes the first letter of the first and last word for multi-word names", () => {
    expect(getInitials("Marcus Chen")).toBe("MC");
  });

  it("ignores extra internal whitespace", () => {
    expect(getInitials("  Marcus   Chen  ")).toBe("MC");
  });
});
