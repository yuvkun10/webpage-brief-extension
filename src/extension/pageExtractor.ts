import type { PageSnapshot } from "../domain/summarizer";

export function extractPageSnapshotInPage(): PageSnapshot {
  function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
  }

  function metaContent(selector: string): string | undefined {
    const node = document.querySelector<HTMLMetaElement>(selector);
    return node?.content ? normalizeWhitespace(node.content) : undefined;
  }

  function readableText(element: Element): string {
    const htmlElement = element as HTMLElement;
    return normalizeWhitespace(htmlElement.innerText || element.textContent || "");
  }

  function isVisible(element: Element): boolean {
    const htmlElement = element as HTMLElement;
    const style = window.getComputedStyle(htmlElement);
    const rect = htmlElement.getBoundingClientRect();

    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  const selectors = [
    "article",
    "main",
    "[role='main']",
    "section",
    ".article",
    ".content",
    ".entry",
    ".post",
    ".story",
    "p"
  ];
  const title = normalizeWhitespace(document.title || metaContent("meta[property='og:title']") || "Untitled page");
  const siteName = metaContent("meta[property='og:site_name']") ?? window.location.hostname;
  const description = metaContent("meta[name='description']") ?? metaContent("meta[property='og:description']");
  const seen = new Set<string>();
  const blocks: PageSnapshot["blocks"] = [];

  if (description) {
    blocks.push({
      tagName: "meta",
      text: description
    });
  }

  for (const element of document.querySelectorAll(selectors.join(","))) {
    if (!isVisible(element)) {
      continue;
    }

    const text = readableText(element);
    const key = text.toLowerCase();

    if (text.length < 40 || seen.has(key)) {
      continue;
    }

    seen.add(key);
    blocks.push({
      id: element.id || undefined,
      className: element.className ? String(element.className) : undefined,
      role: element.getAttribute("role") ?? undefined,
      tagName: element.tagName.toLowerCase(),
      text
    });
  }

  if (blocks.length === 0 && document.body) {
    blocks.push({
      tagName: "body",
      text: readableText(document.body)
    });
  }

  return {
    title,
    url: window.location.href,
    siteName,
    blocks
  };
}
