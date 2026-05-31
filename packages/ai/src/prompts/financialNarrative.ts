import type { OnboardingData, FinancialModelOutputs } from '@sme-pitch-ai/shared';

export function buildFinancialNarrativePrompt(
  profile: OnboardingData,
  outputs: FinancialModelOutputs
): { system: string; user: string } {
  const year1 = outputs.annual[0];
  const year3 = outputs.annual[2];

  const system = `You are a financial analyst writing plain-language summaries for business plans. Write clearly for non-finance readers. 150-250 words maximum. No jargon.`;

  const user = `Write a financial narrative summary for ${profile.businessName}'s business plan.

KEY FIGURES:
- Year 1 Revenue: $${year1?.revenue.toLocaleString() ?? 'N/A'}
- Year 3 Revenue: $${year3?.revenue.toLocaleString() ?? 'N/A'}
- Year 1 Net Profit: $${year1?.netProfit.toLocaleString() ?? 'N/A'}
- Breakeven Month: ${outputs.breakeven.breakevenMonth ?? 'Not reached in 3 years'}
- Currency: ${profile.currency}

Write 150-250 words summarising the financial outlook in plain language suitable for a ${profile.fundingType === 'LOAN' ? 'bank' : 'investor'} audience.`;

  return { system, user };
}
