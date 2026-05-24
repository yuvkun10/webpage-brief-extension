import { describe, expect, it } from "vitest";
import { formatBriefAsText } from "../src/domain/briefFormatting";

describe("brief formatting", () => {
  it("exports source metadata and summary bullets as plain text", () => {
    const text = formatBriefAsText({
      title: "Readable article",
      sourceUrl: "https://example.com/article",
      siteName: "Example",
      sentences: ["First useful point.", "Second useful point."],
      wordCount: 6
    });

    expect(text).toBe(
      [
        "Readable article",
        "Example",
        "https://example.com/article",
        "",
        "- First useful point.",
        "- Second useful point.",
        "",
        "Summary words: 6"
      ].join("\n")
    );
  });
});
