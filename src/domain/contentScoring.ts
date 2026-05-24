export interface ContentBlock {
  id?: string;
  tagName?: string;
  className?: string;
  role?: string;
  text: string;
}

export interface RankedContentBlock extends ContentBlock {
  score: number;
  sourceIndex: number;
}

const CONTENT_TAG_BONUS = new Map<string, number>([
  ["article", 20],
  ["main", 18],
  ["section", 9],
  ["p", 8],
  ["li", 3]
]);

const CHROME_TAG_PENALTY = new Map<string, number>([
  ["nav", 40],
  ["header", 26],
  ["footer", 30],
  ["aside", 18],
  ["button", 34],
  ["form", 28]
]);

const BOILERPLATE_PATTERNS = [
  /\b(ad|ads|advert|advertisement|sponsor|promo|promoted)\b/i,
  /\b(banner|cookie|consent|privacy-preferences)\b/i,
  /\b(nav|menu|breadcrumb|sidebar|footer|header)\b/i,
  /\b(login|sign-in|subscribe|newsletter|share|social)\b/i
];

export function scoreContentBlock(block: ContentBlock): number {
  const text = normalizeWhitespace(block.text);
  const words = tokenize(text);
  const tagName = block.tagName?.toLowerCase() ?? "";
  const descriptor = [block.id, block.className, block.role, tagName]
    .filter(Boolean)
    .join(" ");

  if (words.length === 0) {
    return 0;
  }

  let score = Math.min(64, words.length * 1.45);
  score += Math.min(18, countSentences(text) * 5);
  score += CONTENT_TAG_BONUS.get(tagName) ?? 0;
  score -= CHROME_TAG_PENALTY.get(tagName) ?? 0;

  for (const pattern of BOILERPLATE_PATTERNS) {
    if (pattern.test(descriptor)) {
      score -= 24;
    }
  }

  if (words.length < 5) {
    score -= 38;
  } else if (words.length < 12) {
    score -= 18;
  }

  if (text.length < 80) {
    score -= 8;
  }

  return clamp(Math.round(score), 0, 100);
}

export function rankContentBlocks(blocks: ContentBlock[]): RankedContentBlock[] {
  return blocks
    .map((block, index) => ({
      ...block,
      score: scoreContentBlock(block),
      sourceIndex: index
    }))
    .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9'-]{1,}/g) ?? [];
}

function countSentences(value: string): number {
  return (value.match(/[.!?](?:\s|$)/g) ?? []).length || 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
