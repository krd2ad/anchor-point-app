import { useEffect, useState } from 'react';
import { useLoanService } from '../../context/LoanServiceProvider';
import type { UnderwritingScorecard } from '../../types';

// ─── Decision badge ────────────────────────────────────────────────────────────

const DECISION_CONFIG = {
  Approved:  { color: '#4bce97', bg: 'rgba(75,206,151,0.12)',  border: 'rgba(75,206,151,0.30)'  },
  Suspended: { color: '#f5cd47', bg: 'rgba(245,205,71,0.12)', border: 'rgba(245,205,71,0.30)'  },
  Denied:    { color: '#f87168', bg: 'rgba(248,113,104,0.12)', border: 'rgba(248,113,104,0.30)' },
  Pending:   { color: '#8c9bab', bg: 'rgba(140,155,171,0.10)', border: 'rgba(140,155,171,0.25)' },
} as const;

type DecisionKey = keyof typeof DECISION_CONFIG;

function fmtPct(n: number | null): string {
  if (n == null) return 'N/A';
  return `${(n * 100).toFixed(1)}%`;
}

function fmtNum(n: number | null, decimals = 2): string {
  if (n == null) return 'N/A';
  return n.toFixed(decimals);
}

// ─── UnderwritingWidget ────────────────────────────────────────────────────────

interface UnderwritingWidgetProps {
  loanId: string;
}

export function UnderwritingWidget({ loanId }: UnderwritingWidgetProps) {
  const service = useLoanService();
  const [scorecard, setScorecard] = useState<UnderwritingScorecard | null | undefined>(undefined);

  useEffect(() => {
    setScorecard(undefined); // reset on loan change
    service.getScorecard(loanId).then((sc) => setScorecard(sc));
  }, [service, loanId]);

  // Loading
  if (scorecard === undefined) {
    return (
      <div className="mx-4 my-3 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-3 flex items-center gap-2">
        <span className="animate-spin h-4 w-4 border-2 border-[#3d4b5c] border-t-[#579dff] rounded-full flex-shrink-0" />
        <span className="text-[11px] text-[#5d6f7e]">Loading scorecard…</span>
      </div>
    );
  }

  // Not yet computed
  if (scorecard === null) {
    return (
      <div className="mx-4 my-3 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-3">
        <p className="text-[11px] text-[#5d6f7e] italic">Scorecard not yet computed</p>
      </div>
    );
  }

  const decisionKey: DecisionKey = scorecard.decision ?? 'Pending';
  const cfg = DECISION_CONFIG[decisionKey];

  const metrics = [
    { label: 'LTV',        value: fmtPct(scorecard.ltv)      },
    { label: 'LTC',        value: fmtPct(scorecard.ltc)      },
    { label: 'DSCR',       value: fmtNum(scorecard.dscr)     },
    { label: 'Debt Yield', value: fmtNum(scorecard.debtYield) },
  ];

  // Anchor points: count pass rules with key containing 'anchor'
  const anchorCount = scorecard.anchorPointCount;
  const anchorTotal = scorecard.rules.filter((r) => r.key.startsWith('anchor')).length;
  const anchorPassed = anchorCount;
  const anchorOk = anchorPassed >= 3; // Bridge Loan Program: ≥3 anchor points required

  return (
    <div className="mx-4 my-3 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-[#7a8899]">
          Underwriting Quick View
        </span>
        {/* Decision badge */}
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {decisionKey}
        </span>
      </div>

      {/* 2×2 metrics grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {metrics.map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#282e33] rounded px-2.5 py-1.5 flex flex-col gap-0.5"
          >
            <span className="text-[10px] text-[#5d6f7e] uppercase tracking-wider">{label}</span>
            <span className="text-xs font-semibold text-[#e8ecf0] tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      {/* Anchor points */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[11px] text-[#7a8899]">
          Anchor points
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{ color: anchorOk ? '#4bce97' : '#f87168' }}
        >
          {anchorPassed}{anchorTotal > 0 ? `/${anchorTotal}` : ''} {anchorOk ? '✓ pass' : '✗ fail'}
        </span>
      </div>

      {/* Deviations */}
      {scorecard.deviations.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {scorecard.deviations.map((dev, i) => (
            <span
              key={i}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ color: '#f87168', backgroundColor: 'rgba(248,113,104,0.10)', border: '1px solid rgba(248,113,104,0.25)' }}
            >
              {dev}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
