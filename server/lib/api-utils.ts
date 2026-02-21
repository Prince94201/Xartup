/**
 * Shared helpers for API routes.
 * Includes URL validation, text trimming, Jina Reader URL building, and safe JSON parsing.
 */

export function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function trimText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3))}...`;
}

export function buildJinaUrl(url: string): string {
  return `https://r.jina.ai/${url}`;
}

export function safeParseJson(raw: string): object | null {
  try {
    let s = raw.trim();

    // Strip common markdown code fences if the model returns them.
    // Examples: ```json\n{...}\n``` or ```\n{...}\n```
    if (s.startsWith("```")) {
      s = s.replace(/^```[a-zA-Z]*\s*/m, "");
      s = s.replace(/\s*```\s*$/m, "");
      s = s.trim();
    }

    return JSON.parse(s) as object;
  } catch {
    return null;
  }
}
