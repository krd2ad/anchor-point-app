import { useState } from 'react';
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
import { useLoans, useSelectedLoan, useLoanService } from '../../context/LoanServiceProvider';
import { BoardHeader } from './BoardHeader';
import { StageColumn } from './StageColumn';
import { LoanCard } from './LoanCard';
import type { Loan } from '../../types';

export function Board() {
  const { loans, loading } = useLoans();
  const { selectedLoanId, selectLoan } = useSelectedLoan();
  const service = useLoanService();

  // Optimistic stage overrides: loanId → stageId after drag
  const [stageOverrides, setStageOverrides] = useState<Map<string, string>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLoan: Loan | undefined = activeId
    ? loans.find((l) => l.id === activeId)
    : undefined;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const loanId = active.id as string;
    const newStageId = over.id as string;
    const currentStageId = stageOverrides.get(loanId) ?? loans.find((l) => l.id === loanId)?.stageId;
    if (currentStageId === newStageId) return;

    setStageOverrides((prev) => new Map(prev).set(loanId, newStageId));
    service.moveLoanToStage(loanId, newStageId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <p className="text-[#b6c2cf] text-sm animate-pulse">Loading loans…</p>
      </div>
    );
  }

  return (
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
  );
}
