import { describe, it, expect } from 'vitest';
import { calculateFinancialModel } from '../services/financialService';
import type { FinancialModelInputs } from '@sme-pitch-ai/shared';

const baseInputs: FinancialModelInputs = {
  currency: 'USD',
  startDate: '2026-01-01',
  productLines: [{
    id: 'p1',
    name: 'SaaS Plan',
    price: 50,
    unitsPerMonth: 10,
    monthlyGrowthRate: 5,
  }],
  fixedCosts: [{ id: 'fc1', name: 'Rent', monthlyAmount: 1000 }],
  variableCosts: [{ id: 'vc1', name: 'COGS', type: 'PERCENT_OF_REVENUE', value: 20 }],
};

describe('calculateFinancialModel', () => {
  it('produces 36 monthly rows', () => {
    const result = calculateFinancialModel(baseInputs);
    expect(result.monthly).toHaveLength(36);
  });

  it('produces 3 annual summaries', () => {
    const result = calculateFinancialModel(baseInputs);
    expect(result.annual).toHaveLength(3);
  });

  it('gross profit = revenue - cogs', () => {
    const result = calculateFinancialModel(baseInputs);
    const m1 = result.monthly[0];
    expect(m1.grossProfit).toBeCloseTo(m1.revenue - m1.cogs, 2);
  });

  it('calculates loan amortisation correctly', () => {
    const inputs: FinancialModelInputs = {
      ...baseInputs,
      loan: { amount: 12000, annualInterestRate: 12, tenureMonths: 12, startMonth: 1 },
    };
    const result = calculateFinancialModel(inputs);
    expect(result.loanSchedule).toHaveLength(12);
    const totalPrincipal = result.loanSchedule!.reduce((s, r) => s + r.principal, 0);
    expect(totalPrincipal).toBeCloseTo(12000, 0);
  });

  it('identifies negative cash months', () => {
    const inputs: FinancialModelInputs = {
      ...baseInputs,
      fixedCosts: [{ id: 'fc1', name: 'High Costs', monthlyAmount: 99999 }],
    };
    const result = calculateFinancialModel(inputs);
    expect(result.monthly[0].isNegativeCash).toBe(true);
  });
});
