import type { Content } from "@tiptap/react";

const DRAFT_KEY = "cedium_draft";

export function loadDraft(): Content {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft || "";
  } catch {
    return "";
  }
}

export function saveDraft(content: Content): void {
  try {
    if (typeof content === "string") {
      localStorage.setItem(DRAFT_KEY, content);
    }
  } catch {
    // localStorage may be unavailable or full
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // localStorage may be unavailable
  }
}
