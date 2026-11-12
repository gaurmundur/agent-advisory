// Tiny markup for content files, so translators never have to write HTML.
//   *word*   -> highlighted word (hero title)
//   **text** -> emphasised text (prompt example)
//   new line -> <br>

export type InlinePart = { text: string; marked: boolean };

/** Split "plain **marked** plain" into parts. `marker` is "*" or "**". */
export function splitMarked(source: string, marker: "*" | "**"): InlinePart[] {
  const escaped = marker.replace(/\*/g, "\\*");
  const pattern = new RegExp(`${escaped}(.+?)${escaped}`, "g");
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) parts.push({ text: source.slice(last, match.index), marked: false });
    parts.push({ text: match[1] ?? "", marked: true });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ text: source.slice(last), marked: false });
  return parts;
}

/** Split text into lines, for rendering with <br> between them. */
export function splitLines(source: string): string[] {
  return source.split("\n");
}
