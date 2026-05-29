import type { LoanService } from './LoanService';
import type {
  Stage,
  StageStep,
  Loan,
  LoanDetail,
  LoanStepStatus,
  Comment,
  StepStatus,
} from '../types';
import { STAGES } from '../data/stages';
import { STAGE_STEPS } from '../data/stageSteps';

// Stub — returns correctly-typed empty structures.
// Wave 1·A replaces this with a full in-memory implementation + seed data.
export class MockLoanService implements LoanService {
  async getStages(): Promise<Stage[]> {
    return STAGES;
  }

  async getStageSteps(stageId: string): Promise<StageStep[]> {
    return STAGE_STEPS.filter(s => s.stageId === stageId);
  }

  async getLoans(): Promise<Loan[]> {
    return [];
  }

  async getLoan(_loanId: string): Promise<LoanDetail> {
    throw new Error('No loans in stub service');
  }

  async getStepStatuses(_loanId: string): Promise<LoanStepStatus[]> {
    return [];
  }

  async moveLoanToStage(_loanId: string, _stageId: string): Promise<Loan> {
    throw new Error('No loans in stub service');
  }

  async setStepStatus(
    _loanId: string,
    _stepId: string,
    _status: StepStatus
  ): Promise<LoanStepStatus> {
    throw new Error('No loans in stub service');
  }

  async addComment(
    _loanId: string,
    _stageId: string,
    _body: string
  ): Promise<Comment> {
    throw new Error('No loans in stub service');
  }

  async resolveComment(_commentId: string): Promise<Comment> {
    throw new Error('No loans in stub service');
  }

  async unresolveComment(_commentId: string): Promise<Comment> {
    throw new Error('No loans in stub service');
  }
}
