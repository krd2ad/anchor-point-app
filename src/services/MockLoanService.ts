import { nanoid } from 'nanoid';
import type { LoanService } from './LoanService';
import type {
  Stage,
  StageStep,
  Loan,
  LoanDetail,
  LoanStepStatus,
  Comment,
  StepStatus,
  BorrowerEntity,
  Principal,
  Parcel,
  Attachment,
} from '../types';
import { STAGES } from '../data/stages';
import { STAGE_STEPS } from '../data/stageSteps';
import {
  SEED_LOANS,
  SEED_BORROWER_ENTITIES,
  SEED_PRINCIPALS,
  SEED_PARCELS,
  SEED_STEP_STATUSES,
  SEED_COMMENTS,
  SEED_ATTACHMENTS,
  SEED_USERS,
} from '../data/seed';

export class MockLoanService implements LoanService {
  private loans       = new Map<string, Loan>();
  private entities    = new Map<string, BorrowerEntity>();
  private principals  = new Map<string, Principal>();
  private parcels     = new Map<string, Parcel>();
  private stepStatuses = new Map<string, LoanStepStatus>();
  private comments    = new Map<string, Comment>();
  private attachments = new Map<string, Attachment>();

  constructor() {
    for (const l  of SEED_LOANS)              this.loans.set(l.id, { ...l });
    for (const e  of SEED_BORROWER_ENTITIES)  this.entities.set(e.id, { ...e });
    for (const p  of SEED_PRINCIPALS)         this.principals.set(p.id, { ...p });
    for (const pa of SEED_PARCELS)            this.parcels.set(pa.id, { ...pa });
    for (const ss of SEED_STEP_STATUSES)      this.stepStatuses.set(ss.id, { ...ss });
    for (const c  of SEED_COMMENTS)           this.comments.set(c.id, { ...c });
    for (const a  of SEED_ATTACHMENTS)        this.attachments.set(a.id, { ...a });
  }

  // ─── Reads ──────────────────────────────────────────────────────────────────

  async getStages(): Promise<Stage[]> {
    return Promise.resolve(STAGES);
  }

  async getStageSteps(stageId: string): Promise<StageStep[]> {
    return Promise.resolve(STAGE_STEPS.filter(s => s.stageId === stageId));
  }

  async getLoans(): Promise<Loan[]> {
    return Promise.resolve([...this.loans.values()]);
  }

  async getLoan(loanId: string): Promise<LoanDetail> {
    const loan = this.loans.get(loanId);
    if (!loan) throw new Error(`Loan not found: ${loanId}`);

    const borrowerEntity = this.entities.get(loan.borrowerEntityId);
    if (!borrowerEntity) throw new Error(`BorrowerEntity not found: ${loan.borrowerEntityId}`);

    const principal = this.principals.get(loan.principalId);
    if (!principal) throw new Error(`Principal not found: ${loan.principalId}`);

    const parcels = loan.parcelIds.map(pid => {
      const p = this.parcels.get(pid);
      if (!p) throw new Error(`Parcel not found: ${pid}`);
      return p;
    });

    const stepStatuses = [...this.stepStatuses.values()].filter(ss => ss.loanId === loanId);
    const comments     = [...this.comments.values()].filter(c => c.loanId === loanId);
    const attachments  = [...this.attachments.values()].filter(a => a.loanId === loanId);

    return Promise.resolve({ loan, borrowerEntity, principal, parcels, stepStatuses, comments, attachments });
  }

  async getStepStatuses(loanId: string): Promise<LoanStepStatus[]> {
    return Promise.resolve(
      [...this.stepStatuses.values()].filter(ss => ss.loanId === loanId)
    );
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  async moveLoanToStage(loanId: string, stageId: string): Promise<Loan> {
    const loan = this.loans.get(loanId);
    if (!loan) throw new Error(`Loan not found: ${loanId}`);
    loan.stageId   = stageId;
    loan.updatedAt = '2025-06-01T00:00:00.000Z';
    return Promise.resolve({ ...loan });
  }

  async setStepStatus(
    loanId: string,
    stepId: string,
    status: StepStatus,
  ): Promise<LoanStepStatus> {
    // Find existing row for this (loanId, stepId) pair
    const existing = [...this.stepStatuses.values()].find(
      ss => ss.loanId === loanId && ss.stepId === stepId
    );

    const isDone = status === 'done';

    if (existing) {
      existing.status      = status;
      existing.completedBy = isDone ? SEED_USERS[0].id : null;
      existing.completedAt = isDone ? '2025-06-01T00:00:00.000Z' : null;
      return Promise.resolve({ ...existing });
    }

    // Create a new row
    const row: LoanStepStatus = {
      id:          nanoid(),
      loanId,
      stepId,
      status,
      completedBy: isDone ? SEED_USERS[0].id : null,
      completedAt: isDone ? '2025-06-01T00:00:00.000Z' : null,
    };
    this.stepStatuses.set(row.id, row);
    return Promise.resolve({ ...row });
  }

  async addComment(loanId: string, stageId: string, body: string): Promise<Comment> {
    const comment: Comment = {
      id:        nanoid(),
      loanId,
      stageId,
      authorId:  SEED_USERS[0].id,
      body,
      resolved:  false,
      createdAt: '2025-06-01T00:00:00.000Z',
    };
    this.comments.set(comment.id, comment);
    return Promise.resolve({ ...comment });
  }

  async resolveComment(commentId: string): Promise<Comment> {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error(`Comment not found: ${commentId}`);
    comment.resolved = true;
    return Promise.resolve({ ...comment });
  }

  async unresolveComment(commentId: string): Promise<Comment> {
    const comment = this.comments.get(commentId);
    if (!comment) throw new Error(`Comment not found: ${commentId}`);
    comment.resolved = false;
    return Promise.resolve({ ...comment });
  }
}
