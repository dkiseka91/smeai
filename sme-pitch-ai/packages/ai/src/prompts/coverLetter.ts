import type { OnboardingData } from '@sme-pitch-ai/shared';

export function buildCoverLetterPrompt(
  profile: OnboardingData,
  funderName: string,
  amount: number,
  purpose: string
): { system: string; user: string } {
  const system = `You are an expert grant and loan application writer. Write formal, professional cover letters that are persuasive and concise. 300-400 words. Professional tone.`;

  const user = `Write a formal funding application cover letter for:

APPLICANT: ${profile.businessName}
CONTACT: ${profile.founders[0]?.name ?? 'The Founder'}
FUNDER: ${funderName}
AMOUNT REQUESTED: $${amount.toLocaleString()} ${profile.currency}
PURPOSE: ${purpose}
BUSINESS STAGE: ${profile.stage}
LOCATION: ${profile.location}, ${profile.country}
INDUSTRY: ${profile.industry}
PROBLEM SOLVED: ${profile.problemSolved}
FUNDING TYPE: ${profile.fundingType}

Write a 300-400 word cover letter. Include: opening paragraph (purpose of letter), business description paragraph, funding need and use paragraph, credibility/team paragraph, closing call to action. Format as a proper business letter.`;

  return { system, user };
}
