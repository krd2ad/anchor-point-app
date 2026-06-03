import { useState, useCallback, useEffect } from 'react';
import { LoanServiceProvider } from './context/LoanServiceProvider';
import { Board } from './components/board/Board';
import { LoanDetailPanel } from './components/detail/LoanDetailPanel';
import { FilesView } from './components/files/FilesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { BoardHeader } from './components/board/BoardHeader';
import { useSelectedLoan } from './context/LoanServiceProvider';
import { ToastProvider } from './components/shared/Toast';
import { useTheme } from './context/ThemeContext';
import { useCommandPalette } from './context/CommandPaletteContext';
import { CommandPalette } from './components/shared/CommandPalette';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import type { AppView } from './components/board/BoardHeader';

// Inner component so we can use hooks after provider mounts
function AppShell() {
  const [view, setView] = useState<AppView>('board');
  const { selectLoan } = useSelectedLoan();
  const { theme, toggleTheme } = useTheme();
  const { open: openPalette } = useCommandPalette();
  const { logout } = useAuth();

  const handleSwitchToBoard = useCallback((loanId?: string) => {
    setView('board');
    if (loanId) selectLoan(loanId);
  }, [selectLoan]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openPalette();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openPalette]);

  // Navigate to a loan: select it and switch to board view
  const handleNavigateToLoan = useCallback((loanId: string) => {
    selectLoan(loanId);
    setView('board');
  }, [selectLoan]);

  return (
    <>
      {view === 'board' ? (
        <Board currentView={view} onViewChange={setView} onLogout={logout} />
      ) : (
        <div className="min-h-screen bg-[#1d2125] flex flex-col">
          <BoardHeader
            zoom={1}
            onZoomIn={() => {}}
            onZoomOut={() => {}}
            onZoomReset={() => {}}
            currentView={view}
            onViewChange={setView}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={logout}
          />
          {view === 'files'     && <FilesView onSwitchToBoard={handleSwitchToBoard} />}
          {view === 'analytics' && <AnalyticsView onSelectLoanAndSwitchToBoard={handleNavigateToLoan} />}
        </div>
      )}
      <LoanDetailPanel onOpenInFiles={() => setView('files')} />
      <CommandPalette onNavigateToLoan={handleNavigateToLoan} />
    </>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return (
    <LoanServiceProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </LoanServiceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
