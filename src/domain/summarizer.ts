import { rankContentBlocks, type ContentBlock } from "./contentScoring";

export interface SummaryOptions {
  title?: string;
  maxSentences?: number;
}

export interface TextSummary {
  sentences: string[];
  wordCount: number;
}

export interface PageSnapshot {
  title: string;
  url: string;
  siteName?: string;
  blocks: ContentBlock[];
}

export interface PageBrief extends TextSummary {
  title: string;
  sourceUrl: string;
  siteName?: string;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "their",
  "this",
  "to",
  "when",
  "with",
  "your"
]);

const LOW_VALUE_SENTENCE = /\b(welcome|share this|subscribe|cookie|login|sign in|contact us)\b/i;

export function summarizeText(text: string, options: SummaryOptions = {}): TextSummary {
  const maxSentences = clampInteger(options.maxSentences ?? 4, 1, 6);
  const sentences = uniqueSentences(splitSentences(text));

  if (sentences.length <= maxSentences) {
    return buildSummary(sentences);
  }

  const scored = scoreSentences(sentences, options.title ?? "");
  const selected = scored
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, maxSentences)
    .sort((left, right) => left.index - right.index)
    .map((sentence) => sentence.text);

  return buildSummary(selected);
}

export function summarizePage(snapshot: PageSnapshot, options: SummaryOptions = {}): PageBrief {
  const rankedBlocks = rankContentBlocks(snapshot.blocks);
  const readableText = rankedBlocks
    .filter((block) => block.score >= 12)
    .slice(0, 8)
    .sort((left, right) => left.sourceIndex - right.sourceIndex)
    .map((block) => block.text)
    .join(" ");
  const fallbackText = snapshot.blocks.map((block) => block.text).join(" ");
  const summary = summarizeText(readableText || fallbackText, {
    ...options,
    title: options.title ?? snapshot.title
  });

  return {
    ...summary,
    title: snapshot.title,
    sourceUrl: snapshot.url,
    siteName: snapshot.siteName
  };
}

function scoreSentences(sentences: string[], title: string): Array<{ index: number; score: number; text: string }> {
  const sentenceTokens = sentences.map((sentence) => tokenizeKeywords(sentence));
  const termFrequency = new Map<string, number>();
  const titleTerms = new Set(tokenizeKeywords(title));

  for (const tokens of sentenceTokens) {
    for (const token of new Set(tokens)) {
      termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1);
    }
  }

  return sentences.map((sentence, index) => {
    const tokens = sentenceTokens[index] ?? [];
    const uniqueTokens = new Set(tokens);
    const frequencyScore = [...uniqueTokens].reduce((score, token) => score + (termFrequency.get(token) ?? 0), 0);
    const titleOverlap = [...uniqueTokens].filter((token) => titleTerms.has(token)).length;
    const wordCount = countWords(sentence);
    const lengthScore = wordCount >= 8 && wordCount <= 32 ? 10 : wordCount > 32 ? 4 : 0;
    const positionScore = index < 3 ? 5 - index : 0;
    const boilerplatePenalty = LOW_VALUE_SENTENCE.test(sentence) ? 30 : 0;

    return {
      index,
      text: sentence,
      score: frequencyScore + titleOverlap * 8 + lengthScore + positionScore - boilerplatePenalty
    };
  });
}

function splitSentences(text: string): string[] {
  return normalizeWhitespace(text).match(/[^.!?]+(?:[.!?]+|$)/g)?.map(normalizeWhitespace).filter(Boolean) ?? [];
}

function uniqueSentences(sentences: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const sentence of sentences) {
    const key = sentence.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(sentence);
    }
  }

  return unique;
}

function buildSummary(sentences: string[]): TextSummary {
  return {
    sentences,
    wordCount: countWords(sentences.join(" "))
  };
}

function tokenizeKeywords(value: string): string[] {
  return (value.toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,}/g) ?? []).filter(
    (token) => token.length > 2 && !STOP_WORDS.has(token)
  );
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function countWords(value: string): number {
  return value.match(/[a-z0-9][a-z0-9'-]*/gi)?.length ?? 0;
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}
