import type { Loan } from '../types';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export function loanRiskScore(loan: Loan): { level: RiskLevel; score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // LTV risk
  if (loan.computedLtv != null) {
    if (loan.computedLtv > 0.75) { score += 3; reasons.push('LTV >75%'); }
    else if (loan.computedLtv > 0.70) { score += 2; reasons.push('LTV >70%'); }
    else if (loan.computedLtv > 0.65) { score += 1; reasons.push('LTV >65%'); }
  }

  // Stage risk — Special Servicing and Foreclosure are high risk
  if (loan.stageId === 'stage-7') { score += 4; reasons.push('Foreclosure'); }
  else if (loan.stageId === 'stage-6') { score += 3; reasons.push('Special Servicing'); }

  // Loan size risk — very large loans
  if (loan.loanAmount > 1_000_000) { score += 1; reasons.push('Large loan (>$1M)'); }

  // Auto pay off is slightly safer
  if (loan.autoPayEnabled) score -= 1;

  // Completed loans have no risk
  if (loan.stageId === 'stage-8') return { level: 'low', score: 0, reasons: [] };

  const level: RiskLevel =
    score >= 6 ? 'critical' :
    score >= 4 ? 'high' :
    score >= 2 ? 'medium' : 'low';

  return { level, score, reasons };
}
