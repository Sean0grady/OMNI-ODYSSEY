import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { formatDate, formatRelativeTime } from "./date";

describe("formatDate", () => {
  const originalTz = process.env.TZ;

  beforeAll(() => {
    // formatDate renders in the system's local timezone, so pin it for a
    // deterministic result regardless of where this suite runs.
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = originalTz;
  });

  it("formats an ISO date as a long-form US date", () => {
    expect(formatDate("2026-03-05T00:00:00.000Z")).toBe("March 5, 2026");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-03-05T12:00:00.000Z");

  it("reports whole days in the past", () => {
    expect(formatRelativeTime("2026-03-03T12:00:00.000Z", now)).toBe(
      "2 days ago"
    );
  });

  it("reports whole days in the future", () => {
    expect(formatRelativeTime("2026-03-07T12:00:00.000Z", now)).toBe(
      "in 2 days"
    );
  });

  it("falls back to the 'minute' unit for a timestamp under a minute away", () => {
    expect(formatRelativeTime("2026-03-05T12:00:30.000Z", now)).toBe(
      "this minute"
    );
  });

  it("reports whole hours before falling back to days", () => {
    expect(formatRelativeTime("2026-03-05T09:00:00.000Z", now)).toBe(
      "3 hours ago"
    );
  });
});
