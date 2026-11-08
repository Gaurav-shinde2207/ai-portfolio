import type { RetrievalHit } from './types';

/** Grounded RAG prompt: context verbatim, every hit cited as path#anchor. */
export function buildRagPrompt(
  question: string,
  hits: RetrievalHit[],
  persona: string
): { system: string; user: string } {
  const context = hits
    .map((hit) => `[${hit.path}#${hit.anchor}]\n${hit.text}`)
    .join('\n\n');
  const user = [
    'Use ONLY the context below to answer. Cite every claim as [path#anchor].',
    'Answer in a complete sentence: copy usernames, URLs, emails, numbers, and tool names EXACTLY as they appear in the context.',
    'Never answer with only a citation — a citation must come after a full prose answer.',
    'If the context does not contain the answer, say so.',
    '',
    'Context:',
    context,
    '',
    `Question: ${question}`,
  ].join('\n');
  return { system: persona, user };
}

/** General AI prompt: no site context. */
export function buildGeneralPrompt(
  question: string,
  persona: string
): { system: string; user: string } {
  return { system: persona, user: `Question: ${question}` };
}
