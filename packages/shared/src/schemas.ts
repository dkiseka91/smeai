import { z } from 'zod';

export const OnboardingDataSchema = z.object({
  businessName: z.string(),
  tagline: z.string().optional(),
  industry: z.string(),
  industryTemplate: z.string(),
  stage: z.enum(['IDEA', 'PRE_REVENUE', 'EARLY', 'GROWTH', 'SCALE']),
  country: z.string(),
  currency: z.string().default('USD'),
  foundedYear: z.number().optional(),
  legalStructure: z.string().optional(),
  missionStatement: z.string().optional(),
  problemSolved: z.string(),
  targetCustomer: z.string(),
  productsServices: z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    unit: z.string(),
  })),
  revenueModel: z.string(),
  competitors: z.array(z.string()).optional(),
  teamSize: z.number(),
  founders: z.array(z.object({
    name: z.string(),
    role: z.string(),
    background: z.string(),
  })),
  currentRevenue: z.number().optional(),
  fundingAmountNeeded: z.number(),
  fundingPurpose: z.string(),
  fundingType: z.enum(['LOAN', 'EQUITY', 'GRANT', 'MIXED']),
  keyMetrics: z.record(z.string()).optional(),
  location: z.string(),
  website: z.string().optional(),
});

export type OnboardingData = z.infer<typeof OnboardingDataSchema>;

export const BusinessPlanContentSchema = z.object({
  audience: z.enum(['BANK', 'INVESTOR', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL']),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    wordCount: z.number(),
    generatedAt: z.string(),
  })),
  totalWordCount: z.number(),
  generatedAt: z.string(),
});

export type BusinessPlanContent = z.infer<typeof BusinessPlanContentSchema>;

export const PitchDeckContentSchema = z.object({
  framework: z.enum(['INVESTOR', 'BANK', 'GRANT', 'ACCELERATOR', 'COMPETITION', 'GENERAL']),
  theme: z.string(),
  slides: z.array(z.object({
    id: z.string(),
    slideNumber: z.number(),
    title: z.string(),
    type: z.enum(['COVER', 'PROBLEM', 'SOLUTION', 'MARKET', 'BUSINESS_MODEL', 'TRACTION', 'TEAM', 'FINANCIALS', 'ASK', 'APPENDIX']),
    headline: z.string(),
    bodyPoints: z.array(z.string()),
    speakerNotes: z.string().optional(),
    dataChart: z.object({ type: z.string(), data: z.unknown() }).optional(),
  })),
  pitchScript: z.string().optional(),
  generatedAt: z.string(),
});

export type PitchDeckContent = z.infer<typeof PitchDeckContentSchema>;

export const FinancialModelInputsSchema = z.object({
  currency: z.string().default('USD'),
  startDate: z.string(),
  productLines: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    unitsPerMonth: z.number(),
    monthlyGrowthRate: z.number(),
    seasonalMultipliers: z.array(z.number()).length(12).optional(),
  })),
  fixedCosts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    monthlyAmount: z.number(),
  })),
  variableCosts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['PERCENT_OF_REVENUE', 'PER_UNIT']),
    value: z.number(),
    productLineId: z.string().optional(),
  })),
  loan: z.object({
    amount: z.number(),
    annualInterestRate: z.number(),
    tenureMonths: z.number(),
    startMonth: z.number().default(1),
  }).optional(),
});

export type FinancialModelInputs = z.infer<typeof FinancialModelInputsSchema>;

export interface MonthlyRow {
  month: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  ebitda: number;
  loanRepayment: number;
  netProfit: number;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  cumulativeCash: number;
  isNegativeCash: boolean;
}

export interface AnnualSummary {
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  ebitda: number;
  netProfit: number;
  netCashFlow: number;
}

export interface BreakevenResult {
  monthlyBreakevenRevenue: number;
  breakevenMonth: number | null;
}

export interface LoanRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface FinancialModelOutputs {
  monthly: MonthlyRow[];
  annual: AnnualSummary[];
  breakeven: BreakevenResult;
  loanSchedule?: LoanRow[];
}

export const PitchReviewResultSchema = z.object({
  scores: z.object({
    clarity: z.number(),
    marketSizing: z.number(),
    differentiation: z.number(),
    teamCredibility: z.number(),
    financialRealism: z.number(),
    tractionEvidence: z.number(),
    askClarity: z.number(),
    deckDesign: z.number(),
  }),
  overallScore: z.number(),
  improvements: z.array(z.object({
    criterion: z.string(),
    issue: z.string(),
    suggestion: z.string(),
  })),
});

export type PitchReviewResult = z.infer<typeof PitchReviewResultSchema>;

export const PLAN_LIMITS = {
  FREE:         { monthlyPlans: 1,  monthlyDecks: 1,  chatQueries: 10,  seats: 1,  watermark: true  },
  ENTREPRENEUR: { monthlyPlans: -1, monthlyDecks: -1, chatQueries: -1,  seats: 1,  watermark: false },
  GROWTH:       { monthlyPlans: -1, monthlyDecks: -1, chatQueries: -1,  seats: 3,  watermark: false },
  CONSULTANT:   { monthlyPlans: -1, monthlyDecks: -1, chatQueries: -1,  seats: 10, watermark: false },
  INSTITUTION:  { monthlyPlans: -1, monthlyDecks: -1, chatQueries: -1,  seats: 50, watermark: false },
} as const;

export type AudienceType = 'BANK' | 'INVESTOR' | 'GRANT' | 'ACCELERATOR' | 'COMPETITION' | 'GENERAL';
export type PitchFramework = 'INVESTOR' | 'BANK' | 'GRANT' | 'ACCELERATOR' | 'COMPETITION' | 'GENERAL';
export type BusinessPlanSection = 'executive_summary' | 'company_overview' | 'market_analysis' | 'products_services' | 'marketing_strategy' | 'operations_plan' | 'management_team' | 'financial_projections' | 'funding_request' | 'appendix';

export const BUSINESS_PLAN_SECTIONS: Array<{ id: BusinessPlanSection; title: string; wordCount: number }> = [
  { id: 'executive_summary',    title: 'Executive Summary',       wordCount: 400 },
  { id: 'company_overview',     title: 'Company Overview',        wordCount: 300 },
  { id: 'market_analysis',      title: 'Market Analysis',         wordCount: 500 },
  { id: 'products_services',    title: 'Products & Services',     wordCount: 400 },
  { id: 'marketing_strategy',   title: 'Marketing Strategy',      wordCount: 350 },
  { id: 'operations_plan',      title: 'Operations Plan',         wordCount: 350 },
  { id: 'management_team',      title: 'Management Team',         wordCount: 300 },
  { id: 'financial_projections', title: 'Financial Projections',  wordCount: 400 },
  { id: 'funding_request',      title: 'Funding Request',         wordCount: 300 },
  { id: 'appendix',             title: 'Appendix',                wordCount: 200 },
];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
