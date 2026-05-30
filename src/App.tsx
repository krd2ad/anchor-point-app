import { useState, useCallback } from 'react';
import { LoanServiceProvider } from './context/LoanServiceProvider';
import { Board } from './components/board/Board';
import { LoanDetailPanel } from './components/detail/LoanDetailPanel';
import { FilesView } from './components/files/FilesView';
import { BoardHeader } from './components/board/BoardHeader';
import { useSelectedLoan } from './context/LoanServiceProvider';
import type { AppView } from './components/board/BoardHeader';

// Inner component so we can use hooks after provider mounts
function AppShell() {
  const [view, setView] = useState<AppView>('board');
  const { selectLoan } = useSelectedLoan();

  const handleSwitchToBoard = useCallback((loanId?: string) => {
    setView('board');
    if (loanId) selectLoan(loanId);
  }, [selectLoan]);

  return (
    <>
      {view === 'board' ? (
        <Board currentView={view} onViewChange={setView} />
      ) : (
        <div className="min-h-screen bg-[#1d2125] flex flex-col">
          <BoardHeader
            zoom={1}
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onZoomReset={() => {}}
            currentView={view}
            onViewChange={setView}
          />
          <FilesView onSwitchToBoard={handleSwitchToBoard} />
        </div>
      )}
      <LoanDetailPanel onOpenInFiles={() => setView('files')} />
    </>
  );
}

export default function App() {
  return (
    <LoanServiceProvider>
      <AppShell />
    </LoanServiceProvider>
  );
}
