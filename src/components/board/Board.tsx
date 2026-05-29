import { STAGES } from '../../data/stages';
import { useLoans, useSelectedLoan } from '../../context/LoanServiceProvider';
import { BoardHeader } from './BoardHeader';
import { StageColumn } from './StageColumn';

export function Board() {
  const { loans, loading } = useLoans();
  const { selectedLoanId, selectLoan } = useSelectedLoan();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <p className="text-[#b6c2cf] text-sm animate-pulse">Loading loans…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1d2125] flex flex-col">
      <BoardHeader />

      {/* Horizontal scrollable column row */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-start px-2 py-4 min-h-full" style={{ minWidth: 'max-content' }}>
          {STAGES.map((stage) => {
            const stageLoans = loans.filter((loan) => loan.stageId === stage.id);
            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                loans={stageLoans}
                selectedLoanId={selectedLoanId}
                onSelectLoan={selectLoan}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
