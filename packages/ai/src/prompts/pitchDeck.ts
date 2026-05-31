import type { OnboardingData } from '@sme-pitch-ai/shared';

const SYSTEM_PROMPT = `You are an expert pitch deck writer and startup advisor. You create compelling investor narratives following the proven problem→solution→market→traction→ask structure.

CRITICAL RULES:
- Return ONLY valid JSON matching the PitchDeckContent schema — no prose wrapper, no markdown code blocks.
- Each slide: concise headline + 3-5 punchy bullet points.
- TAM/SAM/SOM framing for market slide.
- Be specific with numbers from the provided business data.
- Never fabricate metrics or market data not provided.`;

export function buildPitchDeckPrompt(
  profile: OnboardingData,
  framework: string
): { system: string; user: string } {
  const user = `Create a complete pitch deck JSON for this business. Framework: ${framework}.

BUSINESS DATA:
- Business: ${profile.businessName} — ${profile.tagline ?? profile.problemSolved}
- Industry: ${profile.industry} | Stage: ${profile.stage} | Country: ${profile.country}
- Problem: ${profile.problemSolved}
- Target Customer: ${profile.targetCustomer}
- Solution/Products: ${profile.productsServices.map(p => `${p.name}: ${p.description} ($${p.price}/${p.unit})`).join('; ')}
- Revenue Model: ${profile.revenueModel}
- Team: ${profile.founders.map(f => `${f.name}, ${f.role}`).join('; ')} + ${profile.teamSize} total
- Ask: $${profile.fundingAmountNeeded.toLocaleString()} (${profile.fundingType}) for ${profile.fundingPurpose}
${profile.currentRevenue ? `- Traction: $${profile.currentRevenue.toLocaleString()}/month revenue` : ''}

Return a JSON object with this exact structure:
{
  "framework": "${framework}",
  "theme": "aelevate-default",
  "slides": [
    {
      "id": "slide-1",
      "slideNumber": 1,
      "title": "...",
      "type": "COVER",
      "headline": "...",
      "bodyPoints": ["..."],
      "speakerNotes": "..."
    }
  ],
  "pitchScript": "150-word verbal pitch script",
  "generatedAt": "${new Date().toISOString()}"
}

Include slides for: COVER, PROBLEM, SOLUTION, MARKET, BUSINESS_MODEL, TRACTION, TEAM, FINANCIALS, ASK.`;

  return { system: SYSTEM_PROMPT, user };
}
