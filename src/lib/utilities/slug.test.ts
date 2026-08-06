import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Jonathan Hickman's Marvel Saga")).toBe(
      "jonathan-hickman-s-marvel-saga"
    );
  });

  it("collapses consecutive non-alphanumeric characters into one hyphen", () => {
    expect(slugify("Fantastic Four -- Vol. 1")).toBe("fantastic-four-vol-1");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
