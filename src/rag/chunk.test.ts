import { describe, expect, it } from 'vitest';
import { splitIntoChunks } from './chunk';

describe('splitIntoChunks', () => {
  it('splits markdown sections into chunks with heading anchors', () => {
    const text = [
      '# About',
      'Long paragraph about Gaurav. It has two sentences.',
      '',
      '# Contact',
      'Short.',
    ].join('\n');

    const chunks = splitIntoChunks(text);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].anchor).toBe('about');
    expect(chunks[1].anchor).toBe('contact');
    expect(chunks[0].text).toContain('Long paragraph about Gaurav.');
    expect(chunks[1].text).toBe('Short.');
    expect(new Set(chunks.map((c) => c.id)).size).toBe(2);
  });

  it('never splits a sentence and never exceeds maxChars', () => {
    const sentence1 = 'A fairly long introductory sentence about retrieval augmented generation and in-browser inference with words to fill space. ';
    const sentence2 = 'Another lengthy sentence that continues the same theme while adding tokens so the buffer crosses the max boundary. ';
    const text = '# Deep dive\n' + sentence1 + sentence2 + sentence1 + sentence2 + sentence1 + sentence2 + sentence1 + sentence2 + sentence1;

    const chunks = splitIntoChunks(text, { maxChars: 800 });

    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(800);
      expect(chunk.text.endsWith('.')).toBe(true);
      expect(chunk.anchor).toBe('deep-dive');
    }
    expect(chunks.length).toBeGreaterThan(1);
  });

  it('keeps text before any heading in an intro chunk with empty-ish anchor', () => {
    const text = 'Intro line without heading.\n\n# Section\nBody.';

    const chunks = splitIntoChunks(text);

    expect(chunks[0].anchor).toBe('intro');
    expect(chunks[0].text).toContain('Intro line without heading.');
    expect(chunks[1].anchor).toBe('section');
  });
});
