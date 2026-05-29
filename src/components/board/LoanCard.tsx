import { useEffect, useState } from 'react';
import type { Loan } from '../../types';
import { useLoanService } from '../../context/LoanServiceProvider';

interface LoanCardProps {
  loan: Loan;
  isSelected: boolean;
  onSelect: () => void;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `$${parseFloat(m.toFixed(1))}M`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `$${parseFloat(k.toFixed(0))}k`;
  }
  return `$${amount}`;
}

export function LoanCard({ loan, isSelected, onSelect }: LoanCardProps) {
  const service = useLoanService();
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      service.getStageSteps(loan.stageId),
      service.getStepStatuses(loan.id),
    ]).then(([steps, statuses]) => {
      if (cancelled) return;

      const stageStepIds = new Set(steps.map((s) => s.id));
      const done = statuses.filter(
        (ss) => stageStepIds.has(ss.stepId) && ss.status === 'done',
      ).length;

      setTotalCount(steps.length);
      setDoneCount(done);
    });

    return () => {
      cancelled = true;
    };
  }, [loan.id, loan.stageId, service]);

  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div
      onClick={onSelect}
      className={`bg-[#22272b] border border-[#454f59] rounded-md p-3 mb-2 cursor-pointer transition-shadow ${
        isSelected ? 'ring-2 ring-blue-400' : 'hover:border-[#6b7a8d]'
      }`}
    >
      {/* Display label — 2 lines max */}
      <p className="text-[#e8ecf0] text-sm font-medium leading-snug line-clamp-2 mb-1">
        {loan.displayLabel}
      </p>

      {/* Amount + entity badge row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#b6c2cf] text-xs font-mono">
          {formatAmount(loan.loanAmount)}
        </span>
        <span className="text-[#8c9bab] text-[10px] bg-[#2d3748] border border-[#454f59] rounded-full px-2 py-0.5 font-medium">
          {loan.lendingEntity}
        </span>
      </div>

      {/* Step progress */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1 bg-[#454f59] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor:
                  progressPct === 100
                    ? '#4bce97'
                    : progressPct > 50
                      ? '#f5cd47'
                      : '#579dff',
              }}
            />
          </div>
          <span className="text-[#8c9bab] text-[10px] font-mono whitespace-nowrap">
            {doneCount}/{totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
