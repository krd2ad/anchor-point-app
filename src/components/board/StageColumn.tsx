import type { Stage, Loan } from '../../types';
import { LoanCard } from './LoanCard';

interface StageColumnProps {
  stage: Stage;
  loans: Loan[];
  selectedLoanId: string | null;
  onSelectLoan: (id: string) => void;
}

export function StageColumn({
  stage,
  loans,
  selectedLoanId,
  onSelectLoan,
}: StageColumnProps) {
  return (
    <div className="bg-[#282e33] min-w-[260px] max-w-[260px] rounded-lg mx-2 flex flex-col max-h-full">
      {/* Column header */}
      <div
        className="px-3 py-2 flex items-center gap-2 flex-shrink-0 border-b border-[#454f59]"
        style={{ borderLeftWidth: 3, borderLeftColor: stage.color, borderLeftStyle: 'solid' }}
      >
        <span className="text-[#e8ecf0] font-semibold text-sm flex-1 leading-tight">
          {stage.name}
        </span>
        <span
          className="text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center"
          style={{
            backgroundColor: `${stage.color}22`,
            color: stage.color,
            border: `1px solid ${stage.color}44`,
          }}
        >
          {loans.length}
        </span>
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loans.length === 0 ? (
          <p className="text-[#8c9bab] text-xs italic text-center mt-4">
            No loans
          </p>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              isSelected={selectedLoanId === loan.id}
              onSelect={() => onSelectLoan(loan.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
