export interface Chunk {
  id: string;
  anchor: string;
  text: string;
}

/** Split a sentence into its pieces: always keep the terminating punctuation. */
function splitSentences(text: string): string[] {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return [];
  const pieces = trimmed.split(/(?<=[.!?])\s+/);
  return pieces.filter((s) => s.length > 0);
}

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Group paragraphs under each heading into chunks of at most `maxChars`
 * characters, never splitting a sentence. Headings are slugified into
 * anchors; a paragraph that appears before any heading belongs to the
 * "intro" anchor.
 */
export function splitIntoChunks(
  text: string,
  opts: { maxChars: number } = { maxChars: 800 }
): Chunk[] {
  const chunks: Chunk[] = [];
  const maxChars = opts.maxChars;
  let anchor = 'intro';
  let perAnchor = 0;

  const flush = (sentences: string[]) => {
    if (sentences.length === 0) return;
    perAnchor += 1;
    chunks.push({
      id: `${anchor}-${perAnchor}`,
      anchor,
      text: sentences.join(' '),
    });
  };

  let buffer: string[] = [];

  for (const line of text.split('\n')) {
    const heading = line.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      flush(buffer);
      buffer = [];
      anchor = slugify(heading[1]);
      perAnchor = 0;
      continue;
    }
    if (line.trim() === '') continue;
    for (const sentence of splitSentences(line)) {
      const projection = [...buffer, sentence].join(' ');
      if (buffer.length > 0 && projection.length > maxChars) {
        flush(buffer);
        buffer = [sentence];
      } else {
        buffer.push(sentence);
      }
    }
  }
  flush(buffer);

  return chunks;
}
