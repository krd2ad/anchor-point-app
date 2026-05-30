import { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Loan } from '../../types';
import { useLoanService } from '../../context/LoanServiceProvider';
import { STAGE_STEPS } from '../../data/stageSteps';
import { STAGES } from '../../data/stages';

interface LoanCardProps {
  loan: Loan;
  isSelected: boolean;
  onSelect: () => void;
  isOverlay?: boolean;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `$${parseFloat((amount / 1_000_000).toFixed(1))}M`;
  if (amount >= 1_000) return `$${parseFloat((amount / 1_000).toFixed(0))}k`;
  return `$${amount}`;
}

// Critical step IDs per stage — for funding-readiness indicator
const CRITICAL_STEPS_BY_STAGE = new Map<string, Set<string>>();
for (const step of STAGE_STEPS) {
  if (step.severity === 'critical') {
    if (!CRITICAL_STEPS_BY_STAGE.has(step.stageId)) {
      CRITICAL_STEPS_BY_STAGE.set(step.stageId, new Set());
    }
    CRITICAL_STEPS_BY_STAGE.get(step.stageId)!.add(step.id);
  }
}

export function LoanCard({ loan, isSelected, onSelect, isOverlay = false }: LoanCardProps) {
  const service = useLoanService();
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unmetCritical, setUnmetCritical] = useState(0);

  const stage = STAGES.find(s => s.id === loan.stageId);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: loan.id,
    disabled: isOverlay,
  });

  useEffect(() => {
    if (isOverlay) return;
    let cancelled = false;
    Promise.all([
      service.getStageSteps(loan.stageId),
      service.getStepStatuses(loan.id),
    ]).then(([steps, statuses]) => {
      if (cancelled) return;
      const stageStepIds = new Set(steps.map(s => s.id));
      const doneIds = new Set(
        statuses.filter(ss => ss.status === 'done').map(ss => ss.stepId)
      );
      const done = statuses.filter(
        ss => stageStepIds.has(ss.stepId) && ss.status === 'done'
      ).length;
      setTotalCount(steps.length);
      setDoneCount(done);

      // Count unmet critical gates for this stage
      const criticalIds = CRITICAL_STEPS_BY_STAGE.get(loan.stageId);
      if (criticalIds) {
        const unmet = [...criticalIds].filter(id => !doneIds.has(id)).length;
        setUnmetCritical(unmet);
      } else {
        setUnmetCritical(0);
      }
    });
    return () => { cancelled = true; };
  }, [loan.id, loan.stageId, service, isOverlay]);

  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const progressColor =
    progressPct === 100 ? '#4bce97' : progressPct > 50 ? '#f5cd47' : '#579dff';

  const isComplete = loan.stageId === 'stage-8';
  const hasCriticalWarning = unmetCritical > 0 && !isOverlay;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={[
        'bg-[#22272b] border rounded-md p-3 mb-2 transition-all duration-100 select-none',
        isOverlay
          ? 'border-[#579dff] shadow-2xl cursor-grabbing rotate-1 opacity-95'
          : isDragging
            ? 'border-[#454f59] opacity-30 cursor-grabbing'
            : hasCriticalWarning
              ? 'border-[#f87168]/40 cursor-grab hover:border-[#f87168]/60'
              : isSelected
                ? 'border-[#579dff] ring-2 ring-[#579dff]/50 cursor-pointer'
                : isComplete
                  ? 'border-[#4bce97]/30 cursor-grab hover:border-[#4bce97]/50'
                  : 'border-[#454f59] hover:border-[#6b7a8d] cursor-grab',
      ].join(' ')}
    >
      {/* Top row: label + badges */}
      <div className="flex items-start gap-1.5 mb-1">
        {/* Stage color dot */}
        {stage && (
          <span
            className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
        )}
        <p className="text-[#e8ecf0] text-sm font-medium leading-snug line-clamp-2 flex-1">
          {loan.displayLabel}
        </p>
        {isComplete && (
          <span className="flex-shrink-0 text-[9px] font-bold text-[#4bce97] bg-[#4bce97]/15 border border-[#4bce97]/30 rounded px-1 py-0.5 leading-none mt-0.5">
            PAID OFF
          </span>
        )}
      </div>

      {/* Amount + entity badge */}
      <div className="flex items-center justify-between mb-2 pl-3">
        <span className="text-[#b6c2cf] text-xs font-mono">
          {formatAmount(loan.loanAmount)}
        </span>
        <span className="text-[#8c9bab] text-[10px] bg-[#2d3748] border border-[#454f59] rounded-full px-2 py-0.5 font-medium">
          {loan.lendingEntity}
        </span>
      </div>

      {/* Critical gate warning */}
      {hasCriticalWarning && (
        <div className="flex items-center gap-1.5 mb-1.5 pl-3 text-[#f87168]">
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M6 4v3M6 8.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
          </svg>
          <span className="text-[10px] font-medium">
            {unmetCritical} critical gate{unmetCritical > 1 ? 's' : ''} unmet
          </span>
        </div>
      )}

      {/* Step progress */}
      {!isOverlay && totalCount > 0 && (
        <div className="flex items-center gap-2 mt-1 pl-3">
          <div className="flex-1 h-1 bg-[#454f59] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
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
