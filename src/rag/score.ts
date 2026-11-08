/**
 * Scores an answer against expected keywords: true iff every keyword is
 * present as a case-insensitive substring of the lowercased answer.
 */
export function scoreAnswer(answer: string, expectedKeywords: string[]): boolean {
  const haystack = answer.toLowerCase();
  return expectedKeywords.every((kw) => haystack.includes(kw.toLowerCase()));
}
