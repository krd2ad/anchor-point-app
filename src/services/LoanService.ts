import type {
  Stage,
  StageStep,
  Loan,
  LoanDetail,
  LoanStepStatus,
  Comment,
  StepStatus,
} from '../types';

export interface LoanService {
  // reads
  getStages(): Promise<Stage[]>;
  getStageSteps(stageId: string): Promise<StageStep[]>;
  getLoans(): Promise<Loan[]>;
  getLoan(loanId: string): Promise<LoanDetail>;
  getStepStatuses(loanId: string): Promise<LoanStepStatus[]>;

  // mutations
  moveLoanToStage(loanId: string, stageId: string): Promise<Loan>;
  setStepStatus(loanId: string, stepId: string, status: StepStatus): Promise<LoanStepStatus>;
  addComment(loanId: string, stageId: string, body: string): Promise<Comment>;
  resolveComment(commentId: string): Promise<Comment>;
  unresolveComment(commentId: string): Promise<Comment>;
}
