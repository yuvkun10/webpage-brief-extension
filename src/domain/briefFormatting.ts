import type { PageBrief } from "./summarizer";

export function formatBriefAsText(brief: PageBrief): string {
  const header = [brief.title, brief.siteName, brief.sourceUrl].filter(Boolean);
  const bullets = brief.sentences.map((sentence) => `- ${sentence}`);

  return [...header, "", ...bullets, "", `Summary words: ${brief.wordCount}`].join("\n");
}
