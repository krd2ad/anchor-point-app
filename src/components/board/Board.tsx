import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { STAGES } from '../../data/stages';
import { STAGE_STEPS } from '../../data/stageSteps';
import { useLoans, useSelectedLoan, useLoanService } from '../../context/LoanServiceProvider';
import { BoardHeader } from './BoardHeader';
import { StageColumn } from './StageColumn';
import { LoanCard } from './LoanCard';
import type { Loan } from '../../types';

// Stage orders that require critical closing gates to be cleared
const FUNDED_STAGE_ORDER = 4; // Servicing Setup and beyond

interface PendingDrag {
  loanId: string;
  newStageId: string;
  unmetGateLabels: string[];
}

function CriticalGateDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingDrag;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-[#22272b] border border-[#f87168] rounded-xl shadow-2xl w-[420px] mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#f87168]/20 border border-[#f87168]/40 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#f87168]">
              <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 7v4M10 13h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <h3 className="text-[#e8ecf0] font-semibold text-sm">Critical Closing Gates Unmet</h3>
            <p className="text-[#f87168] text-xs mt-0.5">Fund anyway?</p>
          </div>
        </div>

        <p className="text-[#b6c2cf] text-sm mb-3 leading-relaxed">
          The following required steps are not complete:
        </p>
        <ul className="mb-5 space-y-1.5">
          {pending.unmetGateLabels.map((label) => (
            <li key={label} className="flex items-center gap-2 text-sm text-[#f87168]">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0">
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
              </svg>
              {label}
            </li>
          ))}
        </ul>

        <p className="text-[#7a8899] text-xs mb-5">
          This override will be logged as a comment on the loan. The move is not reversible without manually dragging the card back.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm text-[#b6c2cf] bg-[#2d3748] hover:bg-[#3d4b5c] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#f87168] hover:bg-[#e55b52] transition-colors"
          >
            Override &amp; Fund
          </button>
        </div>
      </div>
    </div>
  );
}

// Critical step IDs in Title & Closing
const CRITICAL_STEP_IDS = new Set(
  STAGE_STEPS.filter(s => s.severity === 'critical' && s.stageId === 'stage-3').map(s => s.id)
);

export function Board() {
  const { loans, loading } = useLoans();
  const { selectedLoanId, selectLoan } = useSelectedLoan();
  const service = useLoanService();

  const [stageOverrides, setStageOverrides] = useState<Map<string, string>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLoan: Loan | undefined = activeId
    ? loans.find((l) => l.id === activeId)
    : undefined;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const loanId = active.id as string;
    const newStageId = over.id as string;
    const currentStageId = stageOverrides.get(loanId) ?? loans.find((l) => l.id === loanId)?.stageId;
    if (currentStageId === newStageId) return;

    const newStageOrder = STAGES.find(s => s.id === newStageId)?.order ?? 0;
    const prevStageOrder = STAGES.find(s => s.id === currentStageId)?.order ?? 0;

    // Check critical closing gates when moving into Servicing Setup or beyond
    if (newStageOrder >= FUNDED_STAGE_ORDER && prevStageOrder < FUNDED_STAGE_ORDER) {
      const statuses = await service.getStepStatuses(loanId);
      const doneStepIds = new Set(
        statuses.filter(ss => ss.status === 'done').map(ss => ss.stepId)
      );

      const unmetGates = STAGE_STEPS.filter(
        s => CRITICAL_STEP_IDS.has(s.id) && !doneStepIds.has(s.id)
      );

      if (unmetGates.length > 0) {
        setPendingDrag({ loanId, newStageId, unmetGateLabels: unmetGates.map(s => s.label) });
        return;
      }
    }

    commitMove(loanId, newStageId, currentStageId);
  }

  const commitMove = useCallback((loanId: string, newStageId: string, fromStageId: string | undefined) => {
    setStageOverrides((prev) => new Map(prev).set(loanId, newStageId));
    service.moveLoanToStage(loanId, newStageId);

    // Auto-log override comment if this was a confirmed critical gate override
    if (fromStageId === 'stage-3') {
      service.addComment(
        loanId,
        newStageId,
        '⚠️ Funding override: loan moved to Servicing Setup with one or more critical closing gates unmet. Review required.',
      );
    }
  }, [service]);

  function handleConfirmOverride() {
    if (!pendingDrag) return;
    const fromStage = stageOverrides.get(pendingDrag.loanId) ?? loans.find(l => l.id === pendingDrag.loanId)?.stageId;
    commitMove(pendingDrag.loanId, pendingDrag.newStageId, fromStage);
    setPendingDrag(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <p className="text-[#b6c2cf] text-sm animate-pulse">Loading loans…</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-[#1d2125] flex flex-col">
          <BoardHeader />

          <div className="flex-1 overflow-x-auto">
            <div className="flex items-start px-2 py-4" style={{ minWidth: 'max-content' }}>
              {STAGES.map((stage) => {
                const stageLoans = loans.filter(
                  (l) => (stageOverrides.get(l.id) ?? l.stageId) === stage.id
                );
                return (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    loans={stageLoans}
                    selectedLoanId={selectedLoanId}
                    onSelectLoan={selectLoan}
                    activeId={activeId}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeLoan ? (
            <LoanCard
              loan={activeLoan}
              isSelected={false}
              onSelect={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingDrag && (
        <CriticalGateDialog
          pending={pendingDrag}
          onConfirm={handleConfirmOverride}
          onCancel={() => setPendingDrag(null)}
        />
      )}
    </>
  );
}
