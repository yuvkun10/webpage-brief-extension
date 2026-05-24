import { describe, expect, it } from "vitest";
import { summarizePage, summarizeText } from "../src/domain/summarizer";

describe("summarizer", () => {
  it("selects high-signal sentences and returns them in page order", () => {
    const text = [
      "Welcome to the publication.",
      "Local webpage summarizers should extract readable article text before ranking sentences.",
      "The extension summary should favor sentences that repeat important page terms like extension and summary.",
      "Share this article with your team.",
      "A deterministic summary avoids remote services and produces the same result every time."
    ].join(" ");

    const summary = summarizeText(text, {
      title: "Local webpage extension summary",
      maxSentences: 3
    });

    expect(summary.sentences).toEqual([
      "Local webpage summarizers should extract readable article text before ranking sentences.",
      "The extension summary should favor sentences that repeat important page terms like extension and summary.",
      "A deterministic summary avoids remote services and produces the same result every time."
    ]);
  });

  it("deduplicates repeated sentences and preserves short useful text", () => {
    const summary = summarizeText(
      "Short pages still deserve a useful result. Short pages still deserve a useful result.",
      { maxSentences: 3 }
    );

    expect(summary.sentences).toEqual(["Short pages still deserve a useful result."]);
    expect(summary.wordCount).toBe(7);
  });

  it("summarizes ranked page blocks with source metadata", () => {
    const brief = summarizePage(
      {
        title: "Browser privacy summary",
        url: "https://example.com/privacy",
        siteName: "Example",
        blocks: [
          {
            tagName: "nav",
            className: "menu",
            text: "Home Docs Login"
          },
          {
            tagName: "main",
            text:
              "Browser privacy improves when extensions do their work locally. " +
              "This summary extension reads the active page, ranks article text, and avoids sending content away."
          }
        ]
      },
      { maxSentences: 2 }
    );

    expect(brief.title).toBe("Browser privacy summary");
    expect(brief.sourceUrl).toBe("https://example.com/privacy");
    expect(brief.sentences).toEqual([
      "Browser privacy improves when extensions do their work locally.",
      "This summary extension reads the active page, ranks article text, and avoids sending content away."
    ]);
  });
});
