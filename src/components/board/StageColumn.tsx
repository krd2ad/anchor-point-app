import { useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Stage, Loan, UnderwritingScorecard } from '../../types';
import { useLoanService } from '../../context/LoanServiceProvider';
import { LoanCard } from './LoanCard';

interface StageColumnProps {
  stage: Stage;
  loans: Loan[];
  selectedLoanId: string | null;
  onSelectLoan: (id: string) => void;
  activeId: string | null;
  stageOverrides?: Map<string, string>;
  keyboardFocusedLoanId?: string | null;
  selectedLoanIds?: Set<string>;
  onBulkToggle?: (id: string) => void;
}

function formatPortfolioValue(total: number): string {
  if (total >= 1_000_000) return `$${parseFloat((total / 1_000_000).toFixed(1))}M`;
  if (total >= 1_000) return `$${parseFloat((total / 1_000).toFixed(0))}k`;
  return `$${total}`;
}

// Stages that show the scorecard button (underwriting-relevant)
const SCORECARD_STAGES = new Set(['stage-1', 'stage-2']);

interface ScorecardStats {
  approved: number;
  suspended: number;
  denied: number;
  unknown: number;
  avgLtv: number | null;
  highLtvCount: number;
}

function computeScorecardStats(loans: Loan[], scorecards: UnderwritingScorecard[]): ScorecardStats {
  const scMap = new Map<string, UnderwritingScorecard>(scorecards.map(s => [s.loanId, s]));

  let approved = 0, suspended = 0, denied = 0, unknown = 0;
  let ltvSum = 0, ltvCount = 0, highLtvCount = 0;

  for (const loan of loans) {
    const sc = scMap.get(loan.id);
    if (!sc) {
      unknown++;
    } else {
      if (sc.decision === 'Approved') approved++;
      else if (sc.decision === 'Suspended') suspended++;
      else if (sc.decision === 'Denied') denied++;
      else unknown++;
    }

    const ltv = loan.computedLtv;
    if (ltv != null) {
      ltvSum += ltv;
      ltvCount++;
      if (ltv > 0.7) highLtvCount++;
    }
  }

  return {
    approved,
    suspended,
    denied,
    unknown,
    avgLtv: ltvCount > 0 ? ltvSum / ltvCount : null,
    highLtvCount,
  };
}

function ScorecardPopover({ loans, onClose }: { loans: Loan[]; onClose: () => void }) {
  const service = useLoanService();
  const [stats, setStats] = useState<ScorecardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Lazy-load scorecards on mount
  const loadStats = useCallback(async () => {
    try {
      const scorecards = await Promise.all(
        loans.map(l => service.getScorecard(l.id).catch(() => null))
      );
      const validScorecards = scorecards.filter((s): s is UnderwritingScorecard => s !== null);
      setStats(computeScorecardStats(loans, validScorecards));
    } finally {
      setLoading(false);
    }
  }, [loans, service]);

  // Trigger load on first render
  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="absolute top-full left-0 z-50 mt-1 w-[220px] bg-[#1d2125] border border-[#3d4b5c] rounded-lg shadow-2xl p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[#b6c2cf] uppercase tracking-wider">
          Stage Scorecard
        </span>
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded text-[#5a6878] hover:text-[#b6c2cf] transition-colors"
          aria-label="Close scorecard"
        >
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <p className="text-[11px] text-[#5a6878] italic">Loading…</p>
      ) : stats ? (
        <>
          {/* Decision breakdown */}
          <div className="mb-2">
            <p className="text-[10px] text-[#5a6878] uppercase tracking-wider mb-1">Decisions</p>
            <div className="space-y-0.5">
              {stats.approved > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#4bce97]">Approved</span>
                  <span className="text-[11px] font-mono text-[#4bce97]">{stats.approved}</span>
                </div>
              )}
              {stats.suspended > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#f5cd47]">Suspended</span>
                  <span className="text-[11px] font-mono text-[#f5cd47]">{stats.suspended}</span>
                </div>
              )}
              {stats.denied > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#f87168]">Denied</span>
                  <span className="text-[11px] font-mono text-[#f87168]">{stats.denied}</span>
                </div>
              )}
              {stats.unknown > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5a6878]">Unknown</span>
                  <span className="text-[11px] font-mono text-[#5a6878]">{stats.unknown}</span>
                </div>
              )}
              {stats.approved === 0 && stats.suspended === 0 && stats.denied === 0 && stats.unknown === 0 && (
                <p className="text-[11px] text-[#5a6878] italic">No data</p>
              )}
            </div>
          </div>

          {/* LTV stats */}
          <div className="border-t border-[#3d4b5c] pt-2">
            <p className="text-[10px] text-[#5a6878] uppercase tracking-wider mb-1">LTV</p>
            {stats.avgLtv != null ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#8c9bab]">Avg LTV</span>
                  <span
                    className={`text-[11px] font-mono font-semibold ${
                      stats.avgLtv > 0.7 ? 'text-[#f87168]' :
                      stats.avgLtv > 0.65 ? 'text-[#f5cd47]' : 'text-[#4bce97]'
                    }`}
                  >
                    {(stats.avgLtv * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[11px] text-[#8c9bab]">LTV &gt; 70%</span>
                  <span className={`text-[11px] font-mono font-semibold ${stats.highLtvCount > 0 ? 'text-[#f87168]' : 'text-[#4bce97]'}`}>
                    {stats.highLtvCount}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-[#5a6878] italic">No LTV data</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-[11px] text-[#5a6878] italic">Failed to load</p>
      )}
    </div>
  );
}

export function StageColumn({
  stage,
  loans,
  selectedLoanId,
  onSelectLoan,
  activeId,
  stageOverrides,
  keyboardFocusedLoanId,
  selectedLoanIds,
  onBulkToggle,
}: StageColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id });
  const [showScorecard, setShowScorecard] = useState(false);

  const isDraggingIntoThis = isOver && activeId !== null;
  const isCompleted = stage.id === 'stage-8';
  const showScorecardButton = SCORECARD_STAGES.has(stage.id);

  // Portfolio value for the column header metric
  const portfolioTotal = loans.reduce((sum, l) => sum + l.loanAmount, 0);

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[260px] max-w-[260px] rounded-lg mx-2 flex flex-col transition-colors duration-150 ${
        isDraggingIntoThis
          ? 'bg-[#2c3a47] ring-2 ring-inset ring-[#579dff]/40'
          : isCompleted
            ? 'bg-[#1d2125]'
            : 'bg-[#282e33]'
      }`}
      style={{ maxHeight: 'calc(100vh - 64px)' }}
    >
      {/* Column header */}
      <div
        className="px-3 py-2 flex-shrink-0 border-b border-[#454f59] relative"
        style={{ borderLeftWidth: 3, borderLeftColor: stage.color, borderLeftStyle: 'solid' }}
      >
        <div className="flex items-center gap-2">
          {isCompleted && (
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0 text-[#4bce97]">
              <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.25"/>
              <path d="M3.5 6l1.75 1.75L8.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className={`text-sm flex-1 leading-tight ${isCompleted ? 'italic text-[#8c9bab] font-medium' : 'text-[#e8ecf0] font-semibold'}`}>
            {stage.name}
          </span>

          {/* Scorecard button — only for stage-1 and stage-2 */}
          {showScorecardButton && (
            <button
              onClick={() => setShowScorecard(v => !v)}
              className={`w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors ${
                showScorecard
                  ? 'bg-[#579dff]/20 text-[#579dff]'
                  : 'text-[#5a6878] hover:text-[#8c9bab] hover:bg-[#3d4b5c]'
              }`}
              title="Stage scorecard"
              aria-label="Toggle stage scorecard"
            >
              📊
            </button>
          )}

          <span
            className="text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
            style={
              isCompleted
                ? {
                    backgroundColor: '#4bce9715',
                    color: '#4bce9799',
                    border: '1px solid #4bce9730',
                  }
                : {
                    backgroundColor: `${stage.color}22`,
                    color: stage.color,
                    border: `1px solid ${stage.color}44`,
                  }
            }
          >
            {loans.length}
          </span>
        </div>

        {/* Stage-level portfolio value metric */}
        {loans.length > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] text-[#5c6b7a] font-mono">
              {formatPortfolioValue(portfolioTotal)}
            </span>
            <span className="text-[9px] text-[#454f59]">total</span>
          </div>
        )}

        {/* Scorecard popover */}
        {showScorecard && showScorecardButton && (
          <ScorecardPopover loans={loans} onClose={() => setShowScorecard(false)} />
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-[48px]">
        {loans.length === 0 ? (
          <p className="text-[#8c9bab] text-xs italic text-center mt-4">
            No loans
          </p>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              effectiveStageId={stageOverrides?.get(loan.id) ?? loan.stageId}
              isSelected={selectedLoanId === loan.id}
              isKeyboardFocused={keyboardFocusedLoanId === loan.id}
              isBulkSelected={selectedLoanIds?.has(loan.id) ?? false}
              onSelect={() => onSelectLoan(loan.id)}
              onBulkToggle={onBulkToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
