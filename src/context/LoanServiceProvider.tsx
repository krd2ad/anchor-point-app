import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { LoanService } from '../services/LoanService';
import type { Loan } from '../types';
import { MockLoanService } from '../services/MockLoanService';

// ─── Context shapes ────────────────────────────────────────────────────────────

interface LoansState {
  loans: Loan[];
  loading: boolean;
}

interface SelectedLoanState {
  selectedLoanId: string | null;
  selectLoan: (id: string) => void;
  clearSelection: () => void;
}

const ServiceContext = createContext<LoanService | null>(null);
const LoansContext = createContext<LoansState>({ loans: [], loading: true });
const SelectedLoanContext = createContext<SelectedLoanState>({
  selectedLoanId: null,
  selectLoan: () => {},
  clearSelection: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

const defaultService = new MockLoanService();

interface LoanServiceProviderProps {
  service?: LoanService;
  children: ReactNode;
}

export function LoanServiceProvider({
  service = defaultService,
  children,
}: LoanServiceProviderProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    service.getLoans().then(data => {
      setLoans(data);
      setLoading(false);
    });
  }, [service]);

  const selectLoan = useCallback((id: string) => setSelectedLoanId(id), []);
  const clearSelection = useCallback(() => setSelectedLoanId(null), []);

  return (
    <ServiceContext.Provider value={service}>
      <LoansContext.Provider value={{ loans, loading }}>
        <SelectedLoanContext.Provider value={{ selectedLoanId, selectLoan, clearSelection }}>
          {children}
        </SelectedLoanContext.Provider>
      </LoansContext.Provider>
    </ServiceContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLoanService(): LoanService {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useLoanService must be used inside LoanServiceProvider');
  return ctx;
}

export function useLoans(): LoansState {
  return useContext(LoansContext);
}

export function useSelectedLoan(): SelectedLoanState {
  return useContext(SelectedLoanContext);
}
