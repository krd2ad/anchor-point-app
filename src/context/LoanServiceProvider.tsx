import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { LoanService } from '../services/LoanService';
import type { Loan, MessageTemplate, ExternalParty, UnderwritingScorecard, Attachment } from '../types';
import { MockLoanService } from '../services/MockLoanService';
import { buildFileTree, type FileTreeNode } from '../lib/fileTree';

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

// ─── SOP hooks (Phase 1+) ─────────────────────────────────────────────────────

export function useMessageTemplates(): { templates: MessageTemplate[]; loading: boolean } {
  const service = useLoanService();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    service.getMessageTemplates().then((t) => { setTemplates(t); setLoading(false); });
  }, [service]);
  return { templates, loading };
}

export function useExternalParties(): { parties: ExternalParty[]; loading: boolean } {
  const service = useLoanService();
  const [parties, setParties] = useState<ExternalParty[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    service.getExternalParties().then((p) => { setParties(p); setLoading(false); });
  }, [service]);
  return { parties, loading };
}

export function useScorecard(loanId: string | null): UnderwritingScorecard | null {
  const service = useLoanService();
  const [scorecard, setScorecard] = useState<UnderwritingScorecard | null>(null);
  useEffect(() => {
    if (!loanId) { setScorecard(null); return; }
    service.getScorecard(loanId).then(setScorecard);
  }, [service, loanId]);
  return scorecard;
}

export interface FileTreeState {
  tree: FileTreeNode[];
  loading: boolean;
  showEmptyCategories: boolean;
  setShowEmptyCategories: (v: boolean) => void;
  attachments: Attachment[];
  addMockAttachment: (attachment: Attachment) => void;
}

export function useFileTree(options?: { showEmptyCategories?: boolean }): FileTreeState {
  const service = useLoanService();
  const { loans, loading: loansLoading } = useLoans();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);
  const [showEmptyCategories, setShowEmptyCategories] = useState(
    options?.showEmptyCategories ?? true
  );

  useEffect(() => {
    setAttachmentsLoading(true);
    service.getAllAttachments().then(data => {
      setAttachments(data);
      setAttachmentsLoading(false);
    });
  }, [service]);

  const addMockAttachment = useCallback((attachment: Attachment) => {
    setAttachments(prev => [...prev, attachment]);
  }, []);

  const tree = useMemo(
    () =>
      loansLoading || attachmentsLoading
        ? []
        : buildFileTree(loans, attachments, { showEmptyCategories }),
    [loans, attachments, loansLoading, attachmentsLoading, showEmptyCategories],
  );

  return {
    tree,
    loading: loansLoading || attachmentsLoading,
    showEmptyCategories,
    setShowEmptyCategories,
    attachments,
    addMockAttachment,
  };
}
