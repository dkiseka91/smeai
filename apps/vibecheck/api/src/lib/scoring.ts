import type { Category, CheckStatus, Finding } from './types';

/** Fraction of a check's weight awarded per status. */
const STATUS_FRACTION: Record<CheckStatus, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export function scoreFinding(status: CheckStatus, weight: number): number {
  return STATUS_FRACTION[status] * weight;
}

export function computeScores(findings: Finding[]): { overall: number; byCategory: Record<Category, number> } {
  const totalWeight = findings.reduce((sum, f) => sum + f.weight, 0) || 1;
  const earned = findings.reduce((sum, f) => sum + scoreFinding(f.status, f.weight), 0);
  const overall = Math.round((earned / totalWeight) * 100);

  const categories: Category[] = ['security', 'performance', 'resiliency', 'infrastructure'];
  const byCategory = {} as Record<Category, number>;
  for (const cat of categories) {
    const catFindings = findings.filter((f) => f.category === cat);
    const catWeight = catFindings.reduce((sum, f) => sum + f.weight, 0) || 1;
    const catEarned = catFindings.reduce((sum, f) => sum + scoreFinding(f.status, f.weight), 0);
    byCategory[cat] = catFindings.length ? Math.round((catEarned / catWeight) * 100) : 0;
  }

  return { overall, byCategory };
}
