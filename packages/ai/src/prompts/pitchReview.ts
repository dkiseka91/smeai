import type { PitchDeckContent } from '@sme-pitch-ai/shared';

export function buildPitchReviewPrompt(deck: PitchDeckContent): { system: string; user: string } {
  const system = `You are an experienced venture capital analyst reviewing pitch decks. Return ONLY valid JSON — no prose, no markdown.`;

  const user = `Review this pitch deck against 8 criteria and return scores (1-10) plus improvement suggestions.

DECK:
${JSON.stringify({ framework: deck.framework, slideCount: deck.slides.length, slides: deck.slides.map(s => ({ type: s.type, headline: s.headline, points: s.bodyPoints })) }, null, 2)}

Return this exact JSON structure:
{
  "scores": {
    "clarity": <1-10>,
    "marketSizing": <1-10>,
    "differentiation": <1-10>,
    "teamCredibility": <1-10>,
    "financialRealism": <1-10>,
    "tractionEvidence": <1-10>,
    "askClarity": <1-10>,
    "deckDesign": <1-10>
  },
  "overallScore": <average to 1 decimal>,
  "improvements": [
    { "criterion": "<name>", "issue": "<what's wrong>", "suggestion": "<how to fix>" }
  ]
}`;

  return { system, user };
}
