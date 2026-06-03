// ─── Primitive unions ──────────────────────────────────────────────────────────

export type LendingEntity = 'APL';
export type BorrowerEntityType = 'LLC' | 'Individual' | 'Corp' | 'Trust';
export type PropertyType = 'Land' | 'SFR' | 'Commercial' | 'Other';
export type StepStatus = 'done' | 'not_done' | 'na';
export type AttachmentKind = 'ID' | 'Deed' | 'TermSheet' | 'Settlement' | 'Other';
export type AttachmentStatus = 'requested' | 'received' | 'verified' | 'waived';
export type AttachmentCategory =
  // Stage 1
  | 'Loan Intake'
  // Stage 2
  | 'Processing / Underwriting'
  // Stage 3 subfolders
  | 'Title'
  | 'Loan Documents'
  // Stage 4 (covers 4-6) subfolders
  | 'NSC'
  | 'Draws'
  | 'Extensions'
  | 'Insurance'
  | 'Tax'
  // Stage 5 (was 7) subfolders
  | 'Default / Foreclosure'
  | 'Attorney Correspondence'
  // Stage 6 (was 8)
  | 'Complete / Paid Off';
export type AttachmentFileType = 'pdf' | 'jpg' | 'png' | 'docx' | 'xlsx' | 'other';
export type PaymentDueDay = 1 | 10 | 20;

// ProcessStep metadata types (Phase 1+)
export type OwnerRole =
  | 'Originator' | 'Camila' | 'Rivers' | 'Sam'
  | 'RiversOrSam' | 'Processor' | 'System';
export type ActionType =
  | 'gather' | 'email' | 'text' | 'approval'
  | 'await_third_party' | 'file' | 'compute' | 'decision' | 'hold';
export type StepSeverity = 'normal' | 'critical';
export type SubWorkflow = 'draw' | 'extension';
export type ExternalPartyType = 'servicer' | 'title' | 'law_firm' | 'inspector' | 'bank';

// ─── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  initials: string;
  name: string;
  color: string;
}

// ─── Borrower / Principal / Parcel ────────────────────────────────────────────

export interface BorrowerEntity {
  id: string;
  name: string;
  type: BorrowerEntityType;
  ein: string | null;
}

export interface Principal {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idType: 'DriversLicense' | 'Passport' | 'Other';
  idNumber: string;
  idImageAttachmentId: string | null;
}

export interface Parcel {
  id: string;
  addressLine: string;
  city: string;
  state: string;
  acreage: number | null;
  propertyType: PropertyType;
  valuation: number | null;
}

// ─── Loan ──────────────────────────────────────────────────────────────────────

export interface Loan {
  id: string;
  stageId: string;
  lendingEntity: LendingEntity;           // preserved for existing data
  internalLendingEntity?: LendingEntity;  // SOP clarification field
  borrowerEntityId: string;
  principalId: string;
  parcelIds: string[];
  loanAmount: number;
  currentBalance: number;
  interestRate: number;
  servicer: string;
  originationDate: string | null;
  closingDate: string | null;
  fundedDate: string | null;
  firstPaymentDate: string | null;
  paymentDueDay: PaymentDueDay;
  paymentDayOfMonth?: 1 | 10 | 20;       // SOP alias; aligns with NSC setup
  autoPayEnabled: boolean;
  displayLabel: string;
  // SOP additions (all optional — existing seed data omits them)
  referralPartner?: string;
  loanPosition?: string;                  // e.g. "First Lien"
  titleCompanyId?: string;                // → ExternalParty
  hasDrawProgram?: boolean;
  computedLtv?: number;   // loanAmount / totalParcelValuation — populated by service on read
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Stage ─────────────────────────────────────────────────────────────────────

export interface Stage {
  id: string;
  order: number;
  name: string;
  color: string;
}

// ─── ProcessStep (formerly StageStep) ─────────────────────────────────────────

export interface ProcessStep {
  id: string;
  stageId: string;
  order: number;
  label: string;
  // SOP metadata — all optional so existing seed data compiles unchanged
  ownerRole?: OwnerRole;
  actionType?: ActionType;
  desiredOutcome?: string;
  templateId?: string;                    // → MessageTemplate
  externalPartyType?: ExternalPartyType;
  severity?: StepSeverity;               // 'critical' = loud closing gate
  ruleKey?: string;                       // → underwriting rule
  subWorkflow?: SubWorkflow;
}

// Backward-compat alias — remove once all imports are updated
export type StageStep = ProcessStep;

// ─── LoanStepStatus ────────────────────────────────────────────────────────────

export interface LoanStepStatus {
  id: string;
  loanId: string;
  stepId: string;
  status: StepStatus;
  completedBy: string | null;
  completedAt: string | null;
}

// ─── Comment ───────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  loanId: string;
  stageId: string;
  authorId: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

// ─── Attachment ────────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  loanId: string;
  name: string;
  kind: AttachmentKind;
  status: AttachmentStatus;
  category: AttachmentCategory;
  fileType: AttachmentFileType;
  sizeBytes?: number;
  uploadedAt?: string;
  uploadedById?: string;
}

// ─── MessageTemplate (Phase 3) ─────────────────────────────────────────────────

export interface MessageTemplate {
  id: string;
  name: string;
  channel: 'email' | 'text';
  subject?: string;
  body: string;
  mergeFields: string[];
}

// ─── ExternalParty (Phase 4) ───────────────────────────────────────────────────

export interface ExternalParty {
  id: string;
  type: ExternalPartyType;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

// ─── UnderwritingScorecard (Phase 5) ──────────────────────────────────────────

export type ScorecardDecision = 'Approved' | 'Suspended' | 'Denied' | null;

export interface ScorecardRuleResult {
  key: string;
  label: string;
  result: 'pass' | 'fail' | 'na';
  detail?: string;
}

export interface UnderwritingScorecard {
  loanId: string;
  ltv: number | null;
  ltc: number | null;
  dscr: number | null;
  debtYield: number | null;
  liquidityOk: boolean | null;
  equityOk: boolean | null;
  anchorPointCount: number;
  rules: ScorecardRuleResult[];
  decision: ScorecardDecision;
  deviations: string[];
}

// ─── StageChangeEvent ──────────────────────────────────────────────────────────

export interface StageChangeEvent {
  id: string;
  loanId: string;
  fromStageId: string;
  toStageId: string;
  movedAt: string; // ISO
  movedBy: string; // userId
}

// ─── LoanNote ─────────────────────────────────────────────────────────────────

export interface LoanNote {
  id: string;
  loanId: string;
  body: string;
  updatedAt: string;
  updatedBy: string;
}

// ─── LoanDetail aggregate ──────────────────────────────────────────────────────

export interface LoanDetail {
  loan: Loan;
  borrowerEntity: BorrowerEntity;
  principal: Principal;
  parcels: Parcel[];
  stepStatuses: LoanStepStatus[];
  comments: Comment[];
  attachments: Attachment[];
}
