// ─── Core entities ────────────────────────────────────────────────────────────

export type LendingEntity = 'APL' | 'APG';
export type BorrowerEntityType = 'LLC' | 'Individual' | 'Corp' | 'Trust';
export type PropertyType = 'Land' | 'SFR' | 'Commercial' | 'Other';
export type StepStatus = 'done' | 'not_done' | 'na';
export type AttachmentKind = 'ID' | 'Deed' | 'TermSheet' | 'Settlement' | 'Other';
export type AttachmentStatus = 'requested' | 'received' | 'verified';
export type PaymentDueDay = 1 | 10 | 20;

export interface User {
  id: string;
  initials: string;
  name: string;
  color: string;
}

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

export interface Loan {
  id: string;
  stageId: string;
  lendingEntity: LendingEntity;
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
  autoPayEnabled: boolean;
  displayLabel: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  order: number;
  name: string;
  color: string;
}

export interface StageStep {
  id: string;
  stageId: string;
  order: number;
  label: string;
}

export interface LoanStepStatus {
  id: string;
  loanId: string;
  stepId: string;
  status: StepStatus;
  completedBy: string | null;
  completedAt: string | null;
}

export interface Comment {
  id: string;
  loanId: string;
  stageId: string;
  authorId: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  loanId: string;
  name: string;
  kind: AttachmentKind;
  status: AttachmentStatus;
}

// ─── Aggregate returned by getLoan ────────────────────────────────────────────

export interface LoanDetail {
  loan: Loan;
  borrowerEntity: BorrowerEntity;
  principal: Principal;
  parcels: Parcel[];
  stepStatuses: LoanStepStatus[];
  comments: Comment[];
  attachments: Attachment[];
}
