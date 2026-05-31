import type { FinancialModelInputs, FinancialModelOutputs, MonthlyRow, AnnualSummary, LoanRow, BreakevenResult } from '@sme-pitch-ai/shared';

function calcPMT(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

function buildLoanSchedule(amount: number, annualRate: number, tenureMonths: number, startMonth: number): LoanRow[] {
  const pmt = calcPMT(amount, annualRate, tenureMonths);
  const rows: LoanRow[] = [];
  let balance = amount;
  const r = annualRate / 100 / 12;
  for (let i = 0; i < tenureMonths; i++) {
    const interest = balance * r;
    const principal = pmt - interest;
    balance -= principal;
    rows.push({ month: startMonth + i, payment: pmt, principal, interest, balance: Math.max(0, balance) });
  }
  return rows;
}

export function calculateFinancialModel(inputs: FinancialModelInputs): FinancialModelOutputs {
  const loanSchedule = inputs.loan
    ? buildLoanSchedule(inputs.loan.amount, inputs.loan.annualInterestRate, inputs.loan.tenureMonths, inputs.loan.startMonth)
    : undefined;

  const monthly: MonthlyRow[] = [];
  let cumulativeCash = 0;

  for (let month = 1; month <= 36; month++) {
    let revenue = 0;
    for (const line of inputs.productLines) {
      const seasonMultiplier = line.seasonalMultipliers
        ? (line.seasonalMultipliers[((month - 1) % 12)] ?? 1)
        : 1;
      const units = line.unitsPerMonth * Math.pow(1 + line.monthlyGrowthRate / 100, month - 1);
      revenue += units * line.price * seasonMultiplier;
    }

    let cogs = 0;
    for (const vc of inputs.variableCosts) {
      if (vc.type === 'PERCENT_OF_REVENUE') cogs += revenue * (vc.value / 100);
      else {
        const line = inputs.productLines.find(l => l.id === vc.productLineId) ?? inputs.productLines[0];
        if (line) {
          const units = line.unitsPerMonth * Math.pow(1 + line.monthlyGrowthRate / 100, month - 1);
          cogs += units * vc.value;
        }
      }
    }

    const grossProfit = revenue - cogs;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const operatingExpenses = inputs.fixedCosts.reduce((sum, fc) => sum + fc.monthlyAmount, 0);
    const ebitda = grossProfit - operatingExpenses;
    const loanRow = loanSchedule?.find(r => r.month === month);
    const loanRepayment = loanRow?.payment ?? 0;
    const netProfit = ebitda - loanRepayment;
    const cashInflow = revenue;
    const cashOutflow = cogs + operatingExpenses + loanRepayment;
    const netCashFlow = cashInflow - cashOutflow;
    cumulativeCash += netCashFlow;

    monthly.push({
      month, revenue, cogs, grossProfit, grossMargin, operatingExpenses,
      ebitda, loanRepayment, netProfit, cashInflow, cashOutflow, netCashFlow,
      cumulativeCash, isNegativeCash: cumulativeCash < 0,
    });
  }

  const annual: AnnualSummary[] = [1, 2, 3].map(year => {
    const yearMonths = monthly.slice((year - 1) * 12, year * 12);
    const sum = <K extends keyof MonthlyRow>(key: K) =>
      yearMonths.reduce((s, m) => s + (m[key] as number), 0);
    const revenue = sum('revenue');
    const cogs = sum('cogs');
    const grossProfit = sum('grossProfit');
    return {
      year,
      revenue,
      cogs,
      grossProfit,
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingExpenses: sum('operatingExpenses'),
      ebitda: sum('ebitda'),
      netProfit: sum('netProfit'),
      netCashFlow: sum('netCashFlow'),
    };
  });

  const totalVariableCostRatio = inputs.variableCosts
    .filter(vc => vc.type === 'PERCENT_OF_REVENUE')
    .reduce((sum, vc) => sum + vc.value / 100, 0);
  const totalFixedCosts = inputs.fixedCosts.reduce((sum, fc) => sum + fc.monthlyAmount, 0);
  const monthlyBreakevenRevenue = totalVariableCostRatio < 1
    ? totalFixedCosts / (1 - totalVariableCostRatio)
    : 0;
  const breakevenMonth = monthly.find(m => m.revenue >= monthlyBreakevenRevenue)?.month ?? null;

  const breakeven: BreakevenResult = { monthlyBreakevenRevenue, breakevenMonth };

  return { monthly, annual, breakeven, loanSchedule };
}
