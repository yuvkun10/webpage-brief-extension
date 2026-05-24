import { describe, expect, it } from "vitest";
import { rankContentBlocks, scoreContentBlock } from "../src/domain/contentScoring";

describe("content scoring", () => {
  it("prioritizes article-like body copy over navigation chrome", () => {
    const articleScore = scoreContentBlock({
      tagName: "article",
      text:
        "Local summaries work best when the extension can identify dense explanatory prose. " +
        "This paragraph contains several useful details about the webpage topic and avoids menu labels."
    });

    const navScore = scoreContentBlock({
      tagName: "nav",
      className: "top-nav menu links",
      text: "Home Pricing Blog Contact Login"
    });

    expect(articleScore).toBeGreaterThan(navScore + 20);
  });

  it("ranks visible, information-rich blocks ahead of boilerplate controls", () => {
    const ranked = rankContentBlocks([
      {
        id: "cookie",
        className: "cookie banner consent",
        tagName: "aside",
        text: "Accept cookies Manage preferences"
      },
      {
        id: "lead",
        tagName: "section",
        text:
          "The report explains why teams are moving summarization into local browser workflows. " +
          "It compares page structure, readable text density, and headline overlap across examples."
      }
    ]);

    expect(ranked[0]?.id).toBe("lead");
    expect(ranked[0]?.score).toBeGreaterThan(40);
    expect(ranked[1]?.score).toBeLessThan(10);
  });
});
