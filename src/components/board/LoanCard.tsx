import { useEffect, useState, type MouseEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Loan } from '../../types';
import { useLoanService } from '../../context/LoanServiceProvider';
import { STAGE_STEPS } from '../../data/stageSteps';
import { STAGES } from '../../data/stages';
import { loanRiskScore } from '../../lib/riskScore';
import { dueActions } from '../../lib/dates';
import { formatAmount, daysSince } from '../../lib/formatters';

interface LoanCardProps {
  loan: Loan;
  isSelected: boolean;
  onSelect: () => void;
  isOverlay?: boolean;
  effectiveStageId?: string;
  isKeyboardFocused?: boolean;
  isBulkSelected?: boolean;
  onBulkToggle?: (id: string) => void;
  isStarred?: boolean;
  onStarToggled?: (loan: Loan) => void;
  onMovedToStage?: (loanId: string, newStageId: string) => void;
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

export function LoanCard({ loan, isSelected, onSelect, isOverlay = false, effectiveStageId, isKeyboardFocused = false, isBulkSelected = false, onBulkToggle, isStarred: isStarredProp, onStarToggled, onMovedToStage }: LoanCardProps) {
  const service = useLoanService();
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [unmetCritical, setUnmetCritical] = useState(0);

  // Use effectiveStageId (post-drag override) when present, fall back to loan.stageId
  const activeStageId = effectiveStageId ?? loan.stageId;
  const stage = STAGES.find(s => s.id === activeStageId);

  // Effective isStarred: prop override (from Board) takes precedence over loan.isStarred
  const effectiveIsStarred = isStarredProp !== undefined ? isStarredProp : (loan.isStarred ?? false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: loan.id,
    disabled: isOverlay,
  });

  useEffect(() => {
    if (isOverlay) return;
    let cancelled = false;
    Promise.all([
      service.getStageSteps(activeStageId),
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
      const criticalIds = CRITICAL_STEPS_BY_STAGE.get(activeStageId);
      if (criticalIds) {
        const unmet = [...criticalIds].filter(id => !doneIds.has(id)).length;
        setUnmetCritical(unmet);
      } else {
        setUnmetCritical(0);
      }
    });
    return () => { cancelled = true; };
  }, [loan.id, activeStageId, service, isOverlay]);

  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const progressColor =
    progressPct === 100 ? '#4bce97' : progressPct > 50 ? '#f5cd47' : '#579dff';

  const isComplete = activeStageId === 'stage-8';
  const hasCriticalWarning = unmetCritical > 0 && !isOverlay;

  const risk = loanRiskScore(loan);

  // Overdue payment indicator (Item 2)
  const today = new Date().toISOString().split('T')[0];
  const hasDueAction = dueActions(activeStageId, loan.firstPaymentDate ?? null, today).length > 0;

  // Next-stage computation (Item 1)
  const currentOrder = STAGES.find(s => s.id === activeStageId)?.order ?? 0;
  const nextStage = STAGES.find(s => s.order === currentOrder + 1);
  const canMoveNext = !isComplete && nextStage !== undefined;

  function handleMoveNext(e: MouseEvent) {
    e.stopPropagation();
    if (!nextStage) return;
    service.moveLoanToStage(loan.id, nextStage.id).then(() => {
      onMovedToStage?.(loan.id, nextStage.id);
    });
  }

  function handleClick(e: MouseEvent) {
    if (e.shiftKey && onBulkToggle) {
      e.preventDefault();
      onBulkToggle(loan.id);
    } else {
      onSelect();
    }
  }

  function handleStarClick(e: MouseEvent) {
    e.stopPropagation();
    service.toggleStar(loan.id).then((updated) => {
      onStarToggled?.(updated);
    });
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={[
        'group relative bg-[#22272b] border rounded-md p-3 mb-2 transition-all duration-100 select-none',
        isOverlay
          ? 'border-[#579dff] shadow-2xl cursor-grabbing rotate-1 opacity-95'
          : isDragging
            ? 'border-[#454f59] opacity-30 cursor-grabbing'
            : isBulkSelected
              ? 'border-[#4bce97]/60 ring-2 ring-[#4bce97]/60 cursor-pointer'
              : hasCriticalWarning
                ? 'border-[#f87168]/40 cursor-grab hover:border-[#f87168]/60'
                : isSelected
                  ? 'border-[#579dff] ring-2 ring-[#579dff]/50 cursor-pointer'
                  : isKeyboardFocused
                    ? 'border-[#579dff]/60 ring-2 ring-[#579dff]/30 ring-dashed cursor-grab'
                    : isComplete
                      ? 'border-[#4bce97]/30 cursor-grab hover:border-[#4bce97]/50'
                      : 'border-[#454f59] hover:border-[#6b7a8d] cursor-grab',
      ].join(' ')}
    >
      {/* Overdue payment indicator (Item 2) */}
      {hasDueAction && !isOverlay && (
        <span
          className="w-2 h-2 rounded-full bg-amber-400 animate-pulse absolute top-2 right-2"
          title="Payment action due"
        />
      )}

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
        {/* Risk dot — only shown for medium / high / critical */}
        {!isComplete && !isOverlay && risk.level !== 'low' && (
          <span
            className={[
              'flex-shrink-0 w-2 h-2 rounded-full mt-1',
              risk.level === 'critical' ? 'bg-red-500 animate-pulse' :
              risk.level === 'high'     ? 'bg-orange-400' :
              /* medium */                'bg-yellow-400',
            ].join(' ')}
            title={`${risk.level.charAt(0).toUpperCase() + risk.level.slice(1)} risk: ${risk.reasons.join(', ')}`}
          />
        )}
        {/* Star button */}
        {!isOverlay && (
          <button
            onClick={handleStarClick}
            className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
            style={{ opacity: effectiveIsStarred ? 1 : undefined }}
            aria-label={effectiveIsStarred ? 'Unstar' : 'Star'}
            title={effectiveIsStarred ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {effectiveIsStarred ? (
              <svg viewBox="0 0 12 12" fill="#f5cd47" className="w-3 h-3">
                <path d="M6 1l1.38 2.79 3.09.45-2.24 2.18.53 3.08L6 8.11 3.24 9.5l.53-3.08L1.53 4.24l3.09-.45L6 1z" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-[#5d6f7e]">
                <path d="M6 1l1.38 2.79 3.09.45-2.24 2.18.53 3.08L6 8.11 3.24 9.5l.53-3.08L1.53 4.24l3.09-.45L6 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Amount + entity badge */}
      <div className="flex items-center mb-1 pl-3">
        <span className="text-[#b6c2cf] text-xs font-mono">
          {formatAmount(loan.loanAmount)}
        </span>
      </div>

      {/* LTV indicator */}
      {loan.computedLtv != null && (
        <div className="pl-3 mb-1.5 flex items-center gap-1.5">
          <span className="text-[10px] text-[#5d6f7e]">LTV</span>
          <span
            className={`text-[10px] font-mono font-semibold ${
              loan.computedLtv > 0.7 ? 'text-[#f87168]' :
              loan.computedLtv > 0.65 ? 'text-[#f5cd47]' : 'text-[#4bce97]'
            }`}
          >
            {(loan.computedLtv * 100).toFixed(0)}%
          </span>
        </div>
      )}

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

      {/* Step progress + days-in-stage badge */}
      {!isOverlay && !isComplete && (
        <div className="flex items-center gap-2 mt-1 pl-3">
          {totalCount > 0 ? (
            <>
              <div className="flex-1 h-1 bg-[#454f59] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
                />
              </div>
              <span className="text-[#8c9bab] text-[10px] font-mono whitespace-nowrap">
                {doneCount}/{totalCount}
              </span>
            </>
          ) : (
            <div className="flex-1" />
          )}
          <DaysInStageBadge updatedAt={loan.updatedAt} />
        </div>
      )}

      {/* Quick-move strip (Item 1) — only visible on card hover */}
      {!isOverlay && canMoveNext && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-2 pt-1.5 border-t border-[#3d4b5c] flex items-center gap-1">
          <button
            onClick={handleMoveNext}
            className="flex items-center gap-1 text-[10px] text-[#5d6f7e] hover:text-[#8c9bab] transition-colors rounded px-1 py-0.5 hover:bg-[#2d3748]"
            title={`Move to ${nextStage?.name}`}
          >
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 flex-shrink-0">
              <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {nextStage?.name}
          </button>
        </div>
      )}
    </div>
  );
}

function DaysInStageBadge({ updatedAt }: { updatedAt: string }) {
  const days = daysSince(updatedAt);

  const colorClass =
    days >= 31 ? 'text-orange-400' :
    days >= 8  ? 'text-yellow-400' :
    'text-[#5d6f7e]';

  return (
    <span className={`text-[10px] font-mono whitespace-nowrap flex-shrink-0 ${colorClass}`}>
      {days}d
    </span>
  );
}
