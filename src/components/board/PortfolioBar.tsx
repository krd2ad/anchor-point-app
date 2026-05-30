import { STAGES } from '../../data/stages';
import { loanRiskScore } from '../../lib/riskScore';
import type { Loan } from '../../types';

interface PortfolioBarProps {
  loans: Loan[];
}

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const DIVIDER = (
  <span className="w-px h-3 bg-[#3d4b5c] flex-shrink-0" />
);

// Stages 1-7 (not stage-8) with their color dots for the mini breakdown
const ACTIVE_STAGES = STAGES.filter((s) => s.id !== 'stage-8');

export function PortfolioBar({ loans }: PortfolioBarProps) {
  const totalLoans = loans.length;
  const totalPortfolioValue = loans.reduce((sum, l) => sum + l.loanAmount, 0);

  // Active = not stage-8 (accounting for stageId on the loan)
  const activeLoans = loans.filter((l) => l.stageId !== 'stage-8').length;

  // Average LTV — skip nulls
  const ltvLoans = loans.filter((l) => l.computedLtv != null);
  const avgLtv =
    ltvLoans.length > 0
      ? ltvLoans.reduce((sum, l) => sum + (l.computedLtv ?? 0), 0) / ltvLoans.length
      : null;

  // Count of loans with LTV > 70%
  const highLtvCount = loans.filter((l) => (l.computedLtv ?? 0) > 70).length;

  // Stage breakdown counts (stages 1-7)
  const stageCounts = ACTIVE_STAGES.map((stage) => ({
    stage,
    count: loans.filter((l) => l.stageId === stage.id).length,
  }));

  const ltvColor =
    avgLtv == null
      ? '#7a8899'
      : avgLtv > 70
      ? '#f87168'
      : avgLtv > 60
      ? '#f5cd47'
      : '#4bce97';


  // Portfolio health score (0-100)
  let healthScore = 100;
  for (const loan of loans) {
    const { level } = loanRiskScore(loan);
    if (level === 'critical') healthScore -= 20;
    else if (level === 'high') healthScore -= 10;
    if ((loan.computedLtv ?? 0) > 0.70) healthScore -= 5;
    if (loan.stageId === 'stage-8') healthScore += 5;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));
  const healthColor = healthScore >= 80 ? '#4bce97' : healthScore >= 60 ? '#f5cd47' : '#f87168';

  return (
    <div className="bg-[#161a1d] border-b border-[#2d3748] px-4 py-1.5 text-[11px] flex items-center gap-6 flex-shrink-0 overflow-x-auto">
      {/* Total loans */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">Total</span>
        <span className="font-bold text-[#e8ecf0]">{totalLoans}</span>
      </span>

      {DIVIDER}

      {/* Portfolio value */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">Portfolio</span>
        <span className="font-bold text-[#e8ecf0]">{formatAmount(totalPortfolioValue)}</span>
      </span>

      {DIVIDER}

      {/* Active loans */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">Active</span>
        <span className="font-bold text-[#e8ecf0]">{activeLoans}</span>
      </span>

      {DIVIDER}

      {/* Avg LTV */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">Avg LTV</span>
        <span className="font-bold" style={{ color: ltvColor }}>
          {avgLtv != null ? `${avgLtv.toFixed(1)}%` : '—'}
        </span>
      </span>

      {DIVIDER}

      {/* High LTV count */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">LTV &gt;70%</span>
        <span
          className="font-bold"
          style={{ color: highLtvCount > 0 ? '#f87168' : '#4bce97' }}
        >
          {highLtvCount}
        </span>
      </span>

      {DIVIDER}

      {/* Mini stage breakdown */}
      <span className="flex items-center gap-3 flex-shrink-0">
        {stageCounts.map(({ stage, count }) => (
          <span key={stage.id} className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[#7a8899]">{stage.name.split(' ')[0]}</span>
            <span className="font-bold text-[#b6c2cf]">{count}</span>
          </span>
        ))}
      </span>

      {DIVIDER}

      {/* Portfolio health score */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[#7a8899]">Health</span>
        <span className="font-bold tabular-nums" style={{ color: healthColor }}>
          {healthScore}/100
        </span>
      </span>
    </div>
  );
}
