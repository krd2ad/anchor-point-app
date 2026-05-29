import type {
  Stage,
  ProcessStep,
  Loan,
  LoanDetail,
  LoanStepStatus,
  Comment,
  StepStatus,
  MessageTemplate,
  ExternalParty,
  UnderwritingScorecard,
} from '../types';

export interface LoanService {
  // ── Stage / step reads ───────────────────────────────────────────────────────
  getStages(): Promise<Stage[]>;
  getStageSteps(stageId: string): Promise<ProcessStep[]>;

  // ── Loan reads ───────────────────────────────────────────────────────────────
  getLoans(): Promise<Loan[]>;
  getLoan(loanId: string): Promise<LoanDetail>;
  getStepStatuses(loanId: string): Promise<LoanStepStatus[]>;

  // ── Mutations ────────────────────────────────────────────────────────────────
  moveLoanToStage(loanId: string, stageId: string): Promise<Loan>;   // never hard-blocks
  setStepStatus(loanId: string, stepId: string, status: StepStatus): Promise<LoanStepStatus>;
  addComment(loanId: string, stageId: string, body: string): Promise<Comment>;
  resolveComment(commentId: string): Promise<Comment>;
  unresolveComment(commentId: string): Promise<Comment>;

  // ── SOP additions (Phase 1+) ─────────────────────────────────────────────────
  getMessageTemplates(): Promise<MessageTemplate[]>;
  getExternalParties(): Promise<ExternalParty[]>;
  getScorecard(loanId: string): Promise<UnderwritingScorecard | null>;
  renderTemplate(templateId: string, loanId: string): Promise<{ subject: string; body: string }>;
}
