import type { OnboardingData } from '@sme-pitch-ai/shared';

const SYSTEM_PROMPT = `You are an expert business plan writer specialising in African and emerging market businesses. You write clear, compelling, evidence-based business documentation that meets the standards of international development finance institutions, commercial banks, and impact investors.

CRITICAL RULES:
- Never fabricate financial data, statistics, or market sizes.
- Always ground claims in the user's provided business data.
- Use language appropriate for the selected audience (bank / investor / grant).
- Reference East African market context when the business is in Uganda, Kenya, Tanzania, Rwanda, or similar markets.
- Avoid US/UK-centric assumptions unless the user's business explicitly targets those markets.
- Output only the requested section content — no preamble, no headings, no "Here is the section:" intro. Pure content only.
- Target word count for each section is specified in the user message.`;

const AFRICAN_COUNTRIES = ['UG', 'KE', 'TZ', 'RW', 'ET', 'GH', 'NG', 'ZA', 'SN', 'CI'];

export function buildBusinessPlanPrompt(
  profile: OnboardingData,
  section: string,
  audience: string
): { system: string; user: string } {
  const isAfrican = AFRICAN_COUNTRIES.includes(profile.country);
  const regionalNote = isAfrican
    ? `This business operates in the East/West African market. Reference relevant regional context: mobile money penetration, informal sector dynamics, infrastructure constraints, and growth opportunities specific to ${profile.country}.`
    : '';

  const user = `Write the "${section}" section of a business plan for the following business.

AUDIENCE: ${audience}
${regionalNote}

BUSINESS DATA:
- Business Name: ${profile.businessName}
${profile.tagline ? `- Tagline: ${profile.tagline}` : ''}
- Industry: ${profile.industry}
- Stage: ${profile.stage}
- Country: ${profile.country}
- Location: ${profile.location}
- Problem Solved: ${profile.problemSolved}
- Target Customer: ${profile.targetCustomer}
- Products/Services: ${profile.productsServices.map(p => `${p.name} ($${p.price}/${p.unit})`).join(', ')}
- Revenue Model: ${profile.revenueModel}
- Team Size: ${profile.teamSize}
- Founders: ${profile.founders.map(f => `${f.name} (${f.role}): ${f.background}`).join('; ')}
- Funding Needed: $${profile.fundingAmountNeeded.toLocaleString()} for ${profile.fundingPurpose}
- Funding Type: ${profile.fundingType}
${profile.currentRevenue ? `- Current Revenue: $${profile.currentRevenue.toLocaleString()}/month` : ''}
${profile.missionStatement ? `- Mission: ${profile.missionStatement}` : ''}
${profile.competitors?.length ? `- Key Competitors: ${profile.competitors.join(', ')}` : ''}

Write approximately 350-500 words of polished, professional content for this section. Calibrate tone for a ${audience.toLowerCase()} audience.`;

  return { system: SYSTEM_PROMPT, user };
}
