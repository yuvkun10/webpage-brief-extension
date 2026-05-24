import { formatBriefAsText } from "../domain/briefFormatting";
import { summarizePage, type PageBrief } from "../domain/summarizer";
import { extractPageSnapshotInPage } from "./pageExtractor";
import "./popup.css";

const summarizeButton = getElement<HTMLButtonElement>("summarize-button");
const copyButton = getElement<HTMLButtonElement>("copy-button");
const downloadButton = getElement<HTMLButtonElement>("download-button");
const sentenceCountInput = getElement<HTMLInputElement>("sentence-count");
const statusText = getElement<HTMLParagraphElement>("status-text");
const titleText = getElement<HTMLHeadingElement>("page-title");
const sourceText = getElement<HTMLParagraphElement>("source-text");
const summaryList = getElement<HTMLUListElement>("summary-list");
const wordCountText = getElement<HTMLParagraphElement>("word-count");

let currentBrief: PageBrief | undefined;

summarizeButton.addEventListener("click", () => {
  void summarizeCurrentTab();
});

copyButton.addEventListener("click", async () => {
  if (!currentBrief) {
    return;
  }

  await navigator.clipboard.writeText(formatBriefAsText(currentBrief));
  setStatus("Copied summary to clipboard.");
});

downloadButton.addEventListener("click", () => {
  if (!currentBrief) {
    return;
  }

  const blob = new Blob([formatBriefAsText(currentBrief)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(currentBrief.title)}-brief.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded plain-text summary.");
});

async function summarizeCurrentTab(): Promise<void> {
  setBusy(true);
  setStatus("Reading this page locally...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      throw new Error("No active tab is available.");
    }

    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageSnapshotInPage
    });
    const snapshot = injection?.result;

    if (!snapshot || snapshot.blocks.length === 0) {
      throw new Error("No readable page text was found.");
    }

    currentBrief = summarizePage(snapshot, {
      maxSentences: Number(sentenceCountInput.value)
    });
    renderBrief(currentBrief);
    setStatus("Summary generated locally.");
  } catch (error) {
    currentBrief = undefined;
    renderEmptyState();
    setStatus(error instanceof Error ? error.message : "Could not summarize this page.");
  } finally {
    setBusy(false);
  }
}

function renderBrief(brief: PageBrief): void {
  titleText.textContent = brief.title;
  sourceText.textContent = brief.siteName ? `${brief.siteName} · ${brief.sourceUrl}` : brief.sourceUrl;
  summaryList.replaceChildren(
    ...brief.sentences.map((sentence) => {
      const item = document.createElement("li");
      item.textContent = sentence;
      return item;
    })
  );
  wordCountText.textContent = `${brief.sentences.length} points · ${brief.wordCount} summary words`;
  copyButton.disabled = brief.sentences.length === 0;
  downloadButton.disabled = brief.sentences.length === 0;
}

function renderEmptyState(): void {
  titleText.textContent = "No summary yet";
  sourceText.textContent = "Open a webpage, then generate a brief.";
  summaryList.replaceChildren();
  wordCountText.textContent = "";
  copyButton.disabled = true;
  downloadButton.disabled = true;
}

function setBusy(isBusy: boolean): void {
  summarizeButton.disabled = isBusy;
  summarizeButton.textContent = isBusy ? "Summarizing..." : "Summarize page";
}

function setStatus(message: string): void {
  statusText.textContent = message;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }

  return element as T;
}

function safeFileName(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "webpage"
  );
}

renderEmptyState();
