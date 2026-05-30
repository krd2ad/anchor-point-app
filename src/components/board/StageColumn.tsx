import { useDroppable } from '@dnd-kit/core';
import type { Stage, Loan } from '../../types';
import { LoanCard } from './LoanCard';

interface StageColumnProps {
  stage: Stage;
  loans: Loan[];
  selectedLoanId: string | null;
  onSelectLoan: (id: string) => void;
  activeId: string | null;
  stageOverrides?: Map<string, string>;
}

function formatPortfolioValue(total: number): string {
  if (total >= 1_000_000) return `$${parseFloat((total / 1_000_000).toFixed(1))}M`;
  if (total >= 1_000) return `$${parseFloat((total / 1_000).toFixed(0))}k`;
  return `$${total}`;
}

export function StageColumn({
  stage,
  loans,
  selectedLoanId,
  onSelectLoan,
  activeId,
  stageOverrides,
}: StageColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage.id });

  const isDraggingIntoThis = isOver && activeId !== null;
  const isCompleted = stage.id === 'stage-8';

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
        className="px-3 py-2 flex-shrink-0 border-b border-[#454f59]"
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
              onSelect={() => onSelectLoan(loan.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
