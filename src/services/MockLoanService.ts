import { nanoid } from 'nanoid';
import type { LoanService } from './LoanService';
import type {
  Stage,
  ProcessStep,
  Loan,
  LoanDetail,
  LoanStepStatus,
  Comment,
  StepStatus,
  BorrowerEntity,
  Principal,
  Parcel,
  Attachment,
  MessageTemplate,
  ExternalParty,
  UnderwritingScorecard,
  StageChangeEvent,
  LoanNote,
} from '../types';
import { STAGES } from '../data/stages';
import { STAGE_STEPS } from '../data/stageSteps';
import { MESSAGE_TEMPLATES } from '../data/messageTemplates';
import { EXTERNAL_PARTIES } from '../data/externalParties';
import { buildScorecard, scorecardInputsForLoan } from '../lib/underwriting';
import {
  SEED_LOANS,
  SEED_BORROWER_ENTITIES,
  SEED_PRINCIPALS,
  SEED_PARCELS,
  SEED_STEP_STATUSES,
  SEED_COMMENTS,
  SEED_ATTACHMENTS,
  SEED_USERS,
  SEED_STAGE_HISTORY,
} from '../data/seed';

export class MockLoanService implements LoanService {
  private loans       = new Map<string, Loan>();
  private entities    = new Map<string, BorrowerEntity>();
  private principals  = new Map<string, Principal>();
  private parcels     = new Map<string, Parcel>();
  private stepStatuses = new Map<string, LoanStepStatus>();
  /** Secondary index: loanId → Map<stepId, LoanStepStatus> for O(1) lookups */
  private stepStatusesByLoan = new Map<string, Map<string, LoanStepStatus>>();
  private comments    = new Map<string, Comment>();
  private attachments = new Map<string, Attachment>();
  private stageHistory = new Map<string, StageChangeEvent[]>();
  private notes       = new Map<string, LoanNote>();

  constructor() {
    for (const l  of SEED_LOANS)              this.loans.set(l.id, { ...l });
    for (const e  of SEED_BORROWER_ENTITIES)  this.entities.set(e.id, { ...e });
    for (const p  of SEED_PRINCIPALS)         this.principals.set(p.id, { ...p });
    for (const pa of SEED_PARCELS)            this.parcels.set(pa.id, { ...pa });
    for (const ss of SEED_STEP_STATUSES)      this.stepStatuses.set(ss.id, { ...ss });
    for (const c  of SEED_COMMENTS)           this.comments.set(c.id, { ...c });
    for (const a  of SEED_ATTACHMENTS)        this.attachments.set(a.id, { ...a });

    // Build secondary index for O(1) step-status lookups by (loanId, stepId)
    for (const ss of SEED_STEP_STATUSES) {
      if (!this.stepStatusesByLoan.has(ss.loanId)) this.stepStatusesByLoan.set(ss.loanId, new Map());
      this.stepStatusesByLoan.get(ss.loanId)!.set(ss.stepId, { ...ss });
    }

    // Seed stage history — group by loanId
    for (const evt of SEED_STAGE_HISTORY) {
      const existing = this.stageHistory.get(evt.loanId) ?? [];
      existing.push({ ...evt });
      this.stageHistory.set(evt.loanId, existing);
    }

    // Seed note for loan-4 (OH9 Holdings)
    const loan4Note: LoanNote = {
      id: 'note-loan-4',
      loanId: 'loan-4',
      body: 'Borrower has been unresponsive since Nov. Rivers to escalate to law firm if no response by month end.',
      updatedAt: '2025-05-15T09:00:00.000Z',
      updatedBy: SEED_USERS[0].id,
    };
    this.notes.set('loan-4', loan4Note);
  }

  // ─── Reads ──────────────────────────────────────────────────────────────────

  async getStages(): Promise<Stage[]> {
    return Promise.resolve(STAGES);
  }

  async getStageSteps(stageId: string): Promise<ProcessStep[]> {
    return Promise.resolve(STAGE_STEPS.filter(s => s.stageId === stageId));
  }

  async getLoans(): Promise<Loan[]> {
    return Promise.resolve(
      [...this.loans.values()].map(loan => {
        const totalValuation = loan.parcelIds
          .map(id => this.parcels.get(id)?.valuation ?? 0)
          .reduce((a, b) => a + b, 0);
        const computedLtv = totalValuation > 0
          ? Math.round((loan.loanAmount / totalValuation) * 1000) / 1000
          : undefined;
        return { ...loan, computedLtv };
      })
    );
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

    const stepStatuses = [...(this.stepStatusesByLoan.get(loanId)?.values() ?? [])];
    const comments     = [...this.comments.values()].filter(c => c.loanId === loanId);
    const attachments  = [...this.attachments.values()].filter(a => a.loanId === loanId);

    return Promise.resolve({ loan, borrowerEntity, principal, parcels, stepStatuses, comments, attachments });
  }

  async getStepStatuses(loanId: string): Promise<LoanStepStatus[]> {
    return Promise.resolve([...(this.stepStatusesByLoan.get(loanId)?.values() ?? [])]);
  }

  // ─── Mutations ──────────────────────────────────────────────────────────────

  async moveLoanToStage(loanId: string, stageId: string): Promise<Loan> {
    const loan = this.loans.get(loanId);
    if (!loan) throw new Error(`Loan not found: ${loanId}`);
    const fromStageId = loan.stageId;
    loan.stageId   = stageId;
    loan.updatedAt = '2026-05-30T00:00:00.000Z';

    // Record stage change event
    const evt: StageChangeEvent = {
      id: nanoid(),
      loanId,
      fromStageId,
      toStageId: stageId,
      movedAt: '2026-05-30T00:00:00.000Z',
      movedBy: SEED_USERS[0].id,
    };
    const history = this.stageHistory.get(loanId) ?? [];
    history.push(evt);
    this.stageHistory.set(loanId, history);

    return Promise.resolve({ ...loan });
  }

  async setStepStatus(
    loanId: string,
    stepId: string,
    status: StepStatus,
  ): Promise<LoanStepStatus> {
    // O(1) lookup via secondary index
    const existing = this.stepStatusesByLoan.get(loanId)?.get(stepId);

    const isDone = status === 'done';

    if (existing) {
      existing.status      = status;
      existing.completedBy = isDone ? SEED_USERS[0].id : null;
      existing.completedAt = isDone ? '2025-06-01T00:00:00.000Z' : null;
      // Keep primary map in sync
      this.stepStatuses.set(existing.id, existing);
      return Promise.resolve({ ...existing });
    }

    // Create a new row and add to both indexes
    const row: LoanStepStatus = {
      id:          nanoid(),
      loanId,
      stepId,
      status,
      completedBy: isDone ? SEED_USERS[0].id : null,
      completedAt: isDone ? '2025-06-01T00:00:00.000Z' : null,
    };
    this.stepStatuses.set(row.id, row);
    if (!this.stepStatusesByLoan.has(loanId)) this.stepStatusesByLoan.set(loanId, new Map());
    this.stepStatusesByLoan.get(loanId)!.set(stepId, row);
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

  async createLoan(data: Pick<Loan, 'displayLabel' | 'loanAmount' | 'lendingEntity'>): Promise<Loan> {
    const id = `loan-${nanoid(6)}`;

    // Create a minimal borrower entity + principal for the new loan
    const entityId = `entity-${nanoid(6)}`;
    const principalId = `principal-${nanoid(6)}`;

    const entity: BorrowerEntity = {
      id: entityId,
      name: data.displayLabel,
      type: 'LLC',
      ein: null,
    };
    const principal: Principal = {
      id: principalId,
      firstName: data.displayLabel,
      lastName: '',
      email: '',
      phone: '',
      idType: 'DriversLicense',
      idNumber: '',
      idImageAttachmentId: null,
    };
    this.entities.set(entityId, entity);
    this.principals.set(principalId, principal);

    const now = new Date().toISOString();
    const loan: Loan = {
      id,
      stageId: 'stage-1',
      lendingEntity: data.lendingEntity,
      borrowerEntityId: entityId,
      principalId,
      parcelIds: [],
      loanAmount: data.loanAmount,
      currentBalance: data.loanAmount,
      interestRate: 0.12,
      servicer: 'NSC',
      originationDate: null,
      closingDate: null,
      fundedDate: null,
      firstPaymentDate: null,
      paymentDueDay: 1,
      autoPayEnabled: false,
      displayLabel: data.displayLabel,
      createdAt: now,
      updatedAt: now,
    };
    this.loans.set(id, loan);
    return Promise.resolve({ ...loan });
  }

  // ─── SOP additions — stubs filled in by later phases ─────────────────────────

  async getMessageTemplates(): Promise<MessageTemplate[]> {
    return Promise.resolve(MESSAGE_TEMPLATES);
  }

  async getExternalParties(): Promise<ExternalParty[]> {
    return Promise.resolve(EXTERNAL_PARTIES);
  }

  async getScorecard(loanId: string): Promise<UnderwritingScorecard | null> {
    const loan = this.loans.get(loanId);
    if (!loan) return null;
    const parcels = loan.parcelIds
      .map(id => this.parcels.get(id))
      .filter((p): p is NonNullable<typeof p> => p != null);
    const inputs = scorecardInputsForLoan(loanId, loan.loanAmount, parcels, loan);
    return buildScorecard(loanId, inputs);
  }

  async getAllAttachments(): Promise<Attachment[]> {
    return Promise.resolve([...this.attachments.values()]);
  }

  async getAttachmentsForLoan(loanId: string): Promise<Attachment[]> {
    return Promise.resolve(
      [...this.attachments.values()].filter(a => a.loanId === loanId)
    );
  }

  async getStageHistory(loanId: string): Promise<StageChangeEvent[]> {
    const events = this.stageHistory.get(loanId) ?? [];
    return Promise.resolve(
      [...events].sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime())
    );
  }

  async getNote(loanId: string): Promise<LoanNote | null> {
    return Promise.resolve(this.notes.get(loanId) ?? null);
  }

  async saveNote(loanId: string, body: string): Promise<LoanNote> {
    const existing = this.notes.get(loanId);
    const note: LoanNote = {
      id: existing?.id ?? nanoid(),
      loanId,
      body,
      updatedAt: new Date().toISOString(),
      updatedBy: SEED_USERS[0].id,
    };
    this.notes.set(loanId, note);
    return Promise.resolve({ ...note });
  }

  async toggleStar(loanId: string): Promise<Loan> {
    const loan = this.loans.get(loanId);
    if (!loan) throw new Error(`Loan not found: ${loanId}`);
    loan.isStarred = !loan.isStarred;
    return Promise.resolve({ ...loan });
  }

  async renderTemplate(
    templateId: string,
    loanId: string,
  ): Promise<{ subject: string; body: string }> {
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return { subject: '', body: '' };

    const loan = this.loans.get(loanId);
    const principal = loan ? this.principals.get(loan.principalId) : null;
    const parcels = loan ? loan.parcelIds.map(id => this.parcels.get(id)).filter(Boolean) : [];
    const firstParcel = parcels[0];

    const mergeValues: Record<string, string> = {
      'Borrower First Name': principal?.firstName ?? 'Borrower',
      'Property Address': firstParcel
        ? `${firstParcel.addressLine}, ${firstParcel.city} ${firstParcel.state}`
        : '[Property Address]',
      'Payment Day': loan?.paymentDueDay ? `the ${loan.paymentDueDay}${loan.paymentDueDay === 1 ? 'st' : loan.paymentDueDay === 10 ? 'th' : 'th'}` : '[Payment Day]',
      'Law Firm Contact': '[Law Firm Contact]',
      'Month Day, Year': '[Month Day, Year]',
      'number': '[number]',
      'Email Addresses': '[Email Addresses]',
    };

    let subject = template.subject ?? '';
    let body = template.body;

    for (const [field, value] of Object.entries(mergeValues)) {
      const placeholder = `[${field}]`;
      subject = subject.split(placeholder).join(value);
      body = body.split(placeholder).join(value);
    }

    return { subject, body };
  }
}
