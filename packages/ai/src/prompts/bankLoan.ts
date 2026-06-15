import type { OnboardingData } from '@sme-pitch-ai/shared';

const BANK_CONTEXT: Record<string, string> = {
  'Stanbic Bank Uganda': 'Stanbic Bank Uganda (part of Standard Bank Group). Focus on commercial banking, SME finance, agri-finance, and trade finance. Typically requires 3-year audited financial statements, a business plan, company registration certificate, director IDs, 6-month bank statements, and collateral or guarantor documentation. Loan amounts typically UGX 5M–500M for SMEs.',
  'DFCU Bank': 'DFCU Bank Uganda. Known for SME and women-entrepreneur-focused lending (the Grow More Loan). Requires business plan, financial projections, business registration, KYC documents, and may accept movable property as collateral. Offers flexible repayment up to 60 months.',
  'Equity Bank Uganda': 'Equity Bank Uganda. Focused on financial inclusion and SME growth. Requires business registration, business plan, 6-month statements, KYC, and references. Known for group lending and progressive loan models for small businesses.',
  'KCB Uganda': 'KCB Bank Uganda (Kenya Commercial Bank Group). Strong in agricultural and trade finance for SMEs. Requires a business plan, financial statements, KYC, business registration, and collateral. Offers revolving credit facilities and invoice discounting for B2B businesses.',
  'Centenary Bank': 'Centenary Bank Uganda. Specialises in rural and agricultural SME finance, microfinance, and community-based lending. Accepts alternative collateral (group guarantees, assets). Requires business plan, registration documents, 3-month statements, and may work with informal-sector businesses.',
};

function getBankContext(bank: string): string {
  return BANK_CONTEXT[bank] ?? `${bank} — a financial institution in the applicant's region. Standard SME loan documentation applies.`;
}

export function buildBankLoanPrompt(
  profile: OnboardingData,
  bankName: string,
  loanAmount: number,
  purpose: string,
  tenureMonths: number
): { system: string; user: string } {
  const currency = profile.currency ?? 'USD';
  const bankCtx = getBankContext(bankName);

  const system = `You are a professional business finance writer with 15 years of experience helping East African SMEs secure bank loans. You write clear, professional loan application narratives that present businesses in the strongest possible light while remaining factually accurate. You know exactly what African bank loan officers look for: revenue stability, ability to repay, business viability, management competence, and clear loan purpose.`;

  const user = `Write a complete bank loan application narrative for the following business applying to ${bankName}.

BANK CONTEXT:
${bankCtx}

BUSINESS PROFILE:
- Business Name: ${profile.businessName}
- Industry: ${profile.industry}
- Business Stage: ${profile.stage}
- Country: ${profile.country}
- Location: ${profile.location}
- Legal Structure: ${profile.legalStructure ?? 'Not specified'}
- Founded: ${profile.foundedYear ?? 'Recently established'}
- Mission: ${profile.missionStatement ?? 'Not provided'}
- Problem Solved: ${profile.problemSolved}
- Products/Services: ${profile.productsServices.map(p => `${p.name} (${currency} ${p.price} per ${p.unit})`).join(', ')}
- Revenue Model: ${profile.revenueModel}
- Target Customer: ${profile.targetCustomer}
- Team Size: ${profile.teamSize}
- Founders: ${profile.founders.map(f => `${f.name} (${f.role}) — ${f.background}`).join('; ')}
- Current Revenue: ${profile.currentRevenue ? `${currency} ${profile.currentRevenue.toLocaleString()}/year` : 'Pre-revenue'}
- Funding Type Requested: ${profile.fundingType}

LOAN REQUEST:
- Bank: ${bankName}
- Loan Amount: ${currency} ${loanAmount.toLocaleString()}
- Purpose: ${purpose}
- Requested Tenure: ${tenureMonths} months

Write the following sections in order. Use formal business language suitable for a bank loan committee. Be specific, confident, and concise. Format with clear section headings.

1. EXECUTIVE SUMMARY (150–200 words) — business overview, loan amount, purpose, repayment plan summary
2. BUSINESS DESCRIPTION (200–250 words) — what the business does, market it serves, competitive advantage, stage of development
3. LOAN PURPOSE & UTILISATION (150–200 words) — exact breakdown of how the ${currency} ${loanAmount.toLocaleString()} will be deployed, expected impact on revenue/growth
4. REPAYMENT PLAN (100–150 words) — projected cash flow to service the loan, proposed monthly repayment, collateral or guarantor offered
5. MANAGEMENT COMPETENCY (100–150 words) — founders' relevant experience and why this team will succeed
6. CONCLUSION & REQUEST (100 words) — formal request to ${bankName}, appreciation, contact information placeholder

Total target: 750–1,000 words. Output professional prose, not bullet points.`;

  return { system, user };
}
