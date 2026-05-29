import type {
  User,
  BorrowerEntity,
  Principal,
  Parcel,
  Loan,
  LoanStepStatus,
  Comment,
  Attachment,
} from '../types';

// ─── Users ────────────────────────────────────────────────────────────────────

export const SEED_USERS: User[] = [
  { id: 'user-1', initials: 'R', name: 'Rivers',  color: '#579dff' },
  { id: 'user-2', initials: 'A', name: 'Ashley',  color: '#9f8fef' },
  { id: 'user-3', initials: 'M', name: 'Marcus',  color: '#4bce97' },
  { id: 'user-4', initials: 'J', name: 'Jordan',  color: '#f5cd47' },
  { id: 'user-5', initials: 'T', name: 'Taylor',  color: '#f87168' },
];

// ─── Borrower Entities ────────────────────────────────────────────────────────

export const SEED_BORROWER_ENTITIES: BorrowerEntity[] = [
  // loan-1 Bill Twyford
  { id: 'entity-1', name: 'Bill Twyford',               type: 'Individual', ein: null },
  // loan-2 Land to Sky Realty LLC
  { id: 'entity-2', name: 'Land to Sky Realty LLC',     type: 'LLC',        ein: '83-4521097' },
  // loan-3 Thomas Kemper (3 parcels)
  { id: 'entity-3', name: 'Thomas Kemper',              type: 'Individual', ein: null },
  // loan-4 OH9 Holdings LLC
  { id: 'entity-4', name: 'OH9 Holdings LLC',           type: 'LLC',        ein: '47-1839204' },
  // loan-5 CR LJFB LLC
  { id: 'entity-5', name: 'CR LJFB LLC',                type: 'LLC',        ein: '92-3047185' },
  // loan-6 Wabash Crossing
  { id: 'entity-6', name: 'Wabash Crossing',            type: 'LLC',        ein: '36-8210934' },
  // loan-7 Ski Resort Chewelah
  { id: 'entity-7', name: 'Ski Resort Chewelah',        type: 'Corp',       ein: '91-4037621' },
];

// ─── Principals ───────────────────────────────────────────────────────────────

export const SEED_PRINCIPALS: Principal[] = [
  {
    id: 'principal-1',
    firstName: 'Bill',       lastName: 'Twyford',
    email: 'bill.twyford@email.com',  phone: '(319) 555-0101',
    idType: 'DriversLicense', idNumber: 'IA-DL-334501', idImageAttachmentId: null,
  },
  {
    id: 'principal-2',
    firstName: 'Deric',      lastName: 'Outley',
    email: 'deric.outley@landtosky.com', phone: '(409) 555-0202',
    idType: 'DriversLicense', idNumber: 'TX-DL-287643', idImageAttachmentId: null,
  },
  {
    id: 'principal-3',
    firstName: 'Thomas',     lastName: 'Kemper',
    email: 'thomas.kemper@email.com', phone: '(409) 555-0303',
    idType: 'DriversLicense', idNumber: 'TX-DL-194872', idImageAttachmentId: null,
  },
  {
    id: 'principal-4',
    firstName: 'James',      lastName: 'Holder',
    email: 'james.holder@oh9holdings.com', phone: '(979) 555-0404',
    idType: 'DriversLicense', idNumber: 'TX-DL-502318', idImageAttachmentId: null,
  },
  {
    id: 'principal-5',
    firstName: 'Carlos',     lastName: 'Rivera',
    email: 'carlos.rivera@crljfb.com', phone: '(570) 555-0505',
    idType: 'DriversLicense', idNumber: 'PA-DL-671049', idImageAttachmentId: null,
  },
  {
    id: 'principal-6',
    firstName: 'Nathan',     lastName: 'Cross',
    email: 'nathan.cross@wabashcrossing.com', phone: '(217) 555-0606',
    idType: 'DriversLicense', idNumber: 'IL-DL-883261', idImageAttachmentId: null,
  },
  {
    id: 'principal-7',
    firstName: 'Sandra',     lastName: 'Petrov',
    email: 'sandra.petrov@skichewelah.com', phone: '(509) 555-0707',
    idType: 'DriversLicense', idNumber: 'WA-DL-449038', idImageAttachmentId: null,
  },
];

// ─── Parcels ──────────────────────────────────────────────────────────────────

export const SEED_PARCELS: Parcel[] = [
  // loan-1 Bill Twyford
  {
    id: 'parcel-1a',
    addressLine: '416 South 1st St', city: 'Clinton', state: 'IA',
    acreage: 0.18, propertyType: 'SFR', valuation: 90000,
  },

  // loan-2 Land to Sky Realty LLC
  {
    id: 'parcel-2a',
    addressLine: '60 Acres Tract', city: 'Port Arthur', state: 'TX',
    acreage: 60, propertyType: 'Land', valuation: 195000,
  },

  // loan-3 Thomas Kemper — 3 parcels
  {
    id: 'parcel-3a',
    addressLine: 'Parcel A — Port Arthur Tract', city: 'Port Arthur', state: 'TX',
    acreage: 12.5, propertyType: 'Land', valuation: 58000,
  },
  {
    id: 'parcel-3b',
    addressLine: 'Parcel B — Port Arthur Tract', city: 'Port Arthur', state: 'TX',
    acreage: 9.8, propertyType: 'Land', valuation: 46000,
  },
  {
    id: 'parcel-3c',
    addressLine: 'Parcel C — Port Arthur Tract', city: 'Port Arthur', state: 'TX',
    acreage: 7.2, propertyType: 'Land', valuation: 72000,
  },

  // loan-4 OH9 Holdings LLC
  {
    id: 'parcel-4a',
    addressLine: '1923 County Rd 202', city: 'Caldwell', state: 'TX',
    acreage: 42.0, propertyType: 'Commercial', valuation: 1650000,
  },

  // loan-5 CR LJFB LLC
  {
    id: 'parcel-5a',
    addressLine: '23A-51-A552 Stoney Mountain Rd', city: 'Jim Thorpe', state: 'PA',
    acreage: 5.3, propertyType: 'Land', valuation: 315000,
  },

  // loan-6 Wabash Crossing
  {
    id: 'parcel-6a',
    addressLine: 'Wabash Crossing Development', city: 'Springfield', state: 'IL',
    acreage: 18.0, propertyType: 'Land', valuation: 230000,
  },

  // loan-7 Ski Resort Chewelah
  {
    id: 'parcel-7a',
    addressLine: 'Ski Resort Access Rd', city: 'Chewelah', state: 'WA',
    acreage: 320.0, propertyType: 'Commercial', valuation: 410000,
  },
];

// ─── Loans ────────────────────────────────────────────────────────────────────

export const SEED_LOANS: Loan[] = [
  {
    id: 'loan-1',
    stageId: 'stage-1',
    lendingEntity: 'APL',
    borrowerEntityId: 'entity-1',
    principalId: 'principal-1',
    parcelIds: ['parcel-1a'],
    loanAmount: 75000,
    currentBalance: 74850,
    interestRate: 12.0,
    servicer: 'NSC',
    originationDate: null,
    closingDate: null,
    fundedDate: null,
    firstPaymentDate: null,
    paymentDueDay: 1,
    autoPayEnabled: false,
    displayLabel: 'Bill Twyford – 416 South 1st St, Clinton IA',
    createdAt: '2025-05-01T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  },
  {
    id: 'loan-2',
    stageId: 'stage-3',
    lendingEntity: 'APL',
    borrowerEntityId: 'entity-2',
    principalId: 'principal-2',
    parcelIds: ['parcel-2a'],
    loanAmount: 150000,
    currentBalance: 149500,
    interestRate: 11.5,
    servicer: 'NSC',
    originationDate: '2025-04-10T00:00:00.000Z',
    closingDate: null,
    fundedDate: null,
    firstPaymentDate: null,
    paymentDueDay: 10,
    autoPayEnabled: false,
    displayLabel: 'Land to Sky Realty LLC – 60 Acres, Port Arthur TX',
    createdAt: '2025-04-10T09:00:00.000Z',
    updatedAt: '2025-05-20T14:00:00.000Z',
  },
  {
    id: 'loan-3',
    stageId: 'stage-3',
    lendingEntity: 'APG',
    borrowerEntityId: 'entity-3',
    principalId: 'principal-3',
    parcelIds: ['parcel-3a', 'parcel-3b', 'parcel-3c'],
    loanAmount: 160000,
    currentBalance: 159200,
    interestRate: 12.5,
    servicer: 'NSC',
    originationDate: '2025-04-15T00:00:00.000Z',
    closingDate: null,
    fundedDate: null,
    firstPaymentDate: null,
    paymentDueDay: 10,
    autoPayEnabled: false,
    displayLabel: 'Thomas Kemper – 3 Parcels, Port Arthur TX',
    createdAt: '2025-04-15T11:00:00.000Z',
    updatedAt: '2025-05-22T16:00:00.000Z',
  },
  {
    id: 'loan-4',
    stageId: 'stage-6',
    lendingEntity: 'APL',
    borrowerEntityId: 'entity-4',
    principalId: 'principal-4',
    parcelIds: ['parcel-4a'],
    loanAmount: 1305000,
    currentBalance: 1298750,
    interestRate: 14.0,
    servicer: 'NSC',
    originationDate: '2024-08-01T00:00:00.000Z',
    closingDate: '2024-08-15T00:00:00.000Z',
    fundedDate: '2024-08-16T00:00:00.000Z',
    firstPaymentDate: '2024-09-01T00:00:00.000Z',
    paymentDueDay: 1,
    autoPayEnabled: false,
    displayLabel: 'OH9 Holdings LLC – 1923 County Rd 202, Caldwell TX',
    hasDrawProgram: true,
    loanPosition: 'First Lien',
    referralPartner: 'Southwest Capital Partners',
    createdAt: '2024-07-20T08:00:00.000Z',
    updatedAt: '2025-05-15T09:00:00.000Z',
  },
  {
    id: 'loan-5',
    stageId: 'stage-6',
    lendingEntity: 'APL',
    borrowerEntityId: 'entity-5',
    principalId: 'principal-5',
    parcelIds: ['parcel-5a'],
    loanAmount: 260000,
    currentBalance: 257800,
    interestRate: 13.0,
    servicer: 'NSC',
    originationDate: '2024-09-05T00:00:00.000Z',
    closingDate: '2024-09-20T00:00:00.000Z',
    fundedDate: '2024-09-21T00:00:00.000Z',
    firstPaymentDate: '2024-10-20T00:00:00.000Z',
    paymentDueDay: 20,
    autoPayEnabled: false,
    displayLabel: 'CR LJFB LLC – 23A-51-A552 Stoney Mountain Rd, Jim Thorpe PA',
    createdAt: '2024-08-28T10:00:00.000Z',
    updatedAt: '2025-05-10T11:00:00.000Z',
  },
  {
    id: 'loan-6',
    stageId: 'stage-7',
    lendingEntity: 'APL',
    borrowerEntityId: 'entity-6',
    principalId: 'principal-6',
    parcelIds: ['parcel-6a'],
    loanAmount: 185000,
    currentBalance: 182400,
    interestRate: 15.0,
    servicer: 'NSC',
    originationDate: '2024-05-01T00:00:00.000Z',
    closingDate: '2024-05-15T00:00:00.000Z',
    fundedDate: '2024-05-16T00:00:00.000Z',
    firstPaymentDate: '2024-06-01T00:00:00.000Z',
    paymentDueDay: 1,
    autoPayEnabled: false,
    displayLabel: 'Wabash Crossing – Springfield IL',
    createdAt: '2024-04-20T08:00:00.000Z',
    updatedAt: '2025-04-01T12:00:00.000Z',
  },
  {
    id: 'loan-7',
    stageId: 'stage-7',
    lendingEntity: 'APG',
    borrowerEntityId: 'entity-7',
    principalId: 'principal-7',
    parcelIds: ['parcel-7a'],
    loanAmount: 320000,
    currentBalance: 315600,
    interestRate: 14.5,
    servicer: 'NSC',
    originationDate: '2024-06-01T00:00:00.000Z',
    closingDate: '2024-06-20T00:00:00.000Z',
    fundedDate: '2024-06-21T00:00:00.000Z',
    firstPaymentDate: '2024-07-10T00:00:00.000Z',
    paymentDueDay: 10,
    autoPayEnabled: false,
    displayLabel: 'Ski Resort Chewelah – Chewelah WA',
    createdAt: '2024-05-25T09:00:00.000Z',
    updatedAt: '2025-03-15T14:00:00.000Z',
  },
];

// ─── Step Statuses ────────────────────────────────────────────────────────────
// Naming convention: step-status-{loanId#}-{stepId}
// stage-1: first 1-2 done, rest not_done
// stage-3: first 2 done, rest not_done
// stage-6: most steps done
// stage-7: most steps done

export const SEED_STEP_STATUSES: LoanStepStatus[] = [
  // ── loan-1 (stage-1, 4 steps) — first 1 done ──────────────────────────────
  { id: 'ss-1-s1-1', loanId: 'loan-1', stepId: 's1-1', status: 'done',     completedBy: 'user-1', completedAt: '2025-05-01T12:00:00.000Z' },
  { id: 'ss-1-s1-2', loanId: 'loan-1', stepId: 's1-2', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-1-s1-3', loanId: 'loan-1', stepId: 's1-3', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-1-s1-4', loanId: 'loan-1', stepId: 's1-4', status: 'not_done', completedBy: null,     completedAt: null },

  // ── loan-2 (stage-3) — stage-2 complete, stage-3 in progress ────────────────
  { id: 'ss-2-s2-1', loanId: 'loan-2', stepId: 's2-1', status: 'done', completedBy: 'user-2', completedAt: '2025-04-12T10:00:00.000Z' },
  { id: 'ss-2-s2-2', loanId: 'loan-2', stepId: 's2-2', status: 'done', completedBy: 'user-1', completedAt: '2025-04-15T10:00:00.000Z' },
  { id: 'ss-2-s2-3', loanId: 'loan-2', stepId: 's2-3', status: 'done', completedBy: 'user-2', completedAt: '2025-04-16T10:00:00.000Z' },

  // ── loan-2 (stage-3, now 10 steps) — first 2 done ────────────────────────
  { id: 'ss-2-s3-1', loanId: 'loan-2', stepId: 's3-1', status: 'done',     completedBy: 'user-2', completedAt: '2025-04-18T10:00:00.000Z' },
  { id: 'ss-2-s3-2', loanId: 'loan-2', stepId: 's3-2', status: 'done',     completedBy: 'user-1', completedAt: '2025-04-25T14:00:00.000Z' },
  { id: 'ss-2-s3-3', loanId: 'loan-2', stepId: 's3-3', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-4', loanId: 'loan-2', stepId: 's3-4', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-5', loanId: 'loan-2', stepId: 's3-5', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-6', loanId: 'loan-2', stepId: 's3-6', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-7', loanId: 'loan-2', stepId: 's3-7', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-8', loanId: 'loan-2', stepId: 's3-8', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-2-s3-9',  loanId: 'loan-2', stepId: 's3-9',  status: 'not_done', completedBy: null, completedAt: null },
  { id: 'ss-2-s3-10', loanId: 'loan-2', stepId: 's3-10', status: 'not_done', completedBy: null, completedAt: null },

  // ── loan-3 (stage-3) — stage-2 complete, stage-3 in progress ────────────────
  { id: 'ss-3-s2-1', loanId: 'loan-3', stepId: 's2-1', status: 'done', completedBy: 'user-2', completedAt: '2025-04-17T10:00:00.000Z' },
  { id: 'ss-3-s2-2', loanId: 'loan-3', stepId: 's2-2', status: 'done', completedBy: 'user-1', completedAt: '2025-04-18T10:00:00.000Z' },
  { id: 'ss-3-s2-3', loanId: 'loan-3', stepId: 's2-3', status: 'done', completedBy: 'user-3', completedAt: '2025-04-19T10:00:00.000Z' },

  // ── loan-3 (stage-3, now 10 steps) — first 2 done ────────────────────────
  { id: 'ss-3-s3-1', loanId: 'loan-3', stepId: 's3-1', status: 'done',     completedBy: 'user-3', completedAt: '2025-04-20T09:00:00.000Z' },
  { id: 'ss-3-s3-2', loanId: 'loan-3', stepId: 's3-2', status: 'done',     completedBy: 'user-1', completedAt: '2025-04-28T11:00:00.000Z' },
  { id: 'ss-3-s3-3', loanId: 'loan-3', stepId: 's3-3', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-4', loanId: 'loan-3', stepId: 's3-4', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-5', loanId: 'loan-3', stepId: 's3-5', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-6', loanId: 'loan-3', stepId: 's3-6', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-7', loanId: 'loan-3', stepId: 's3-7', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-8', loanId: 'loan-3', stepId: 's3-8', status: 'not_done', completedBy: null,     completedAt: null },
  { id: 'ss-3-s3-9',  loanId: 'loan-3', stepId: 's3-9',  status: 'not_done', completedBy: null, completedAt: null },
  { id: 'ss-3-s3-10', loanId: 'loan-3', stepId: 's3-10', status: 'not_done', completedBy: null, completedAt: null },

  // ── loan-4 (stage-6) — OH9 Holdings, delinquent + has draw program ──────────
  // Stages 1-5 all complete (funded, servicing set up, was collecting)
  { id: 'ss-4-s1-1', loanId: 'loan-4', stepId: 's1-1', status: 'done', completedBy: 'user-1', completedAt: '2024-07-22T10:00:00.000Z' },
  { id: 'ss-4-s1-2', loanId: 'loan-4', stepId: 's1-2', status: 'done', completedBy: 'user-1', completedAt: '2024-07-24T10:00:00.000Z' },
  { id: 'ss-4-s1-3', loanId: 'loan-4', stepId: 's1-3', status: 'done', completedBy: 'user-1', completedAt: '2024-07-25T10:00:00.000Z' },
  { id: 'ss-4-s1-4', loanId: 'loan-4', stepId: 's1-4', status: 'done', completedBy: 'user-2', completedAt: '2024-07-26T10:00:00.000Z' },
  { id: 'ss-4-s3-1', loanId: 'loan-4', stepId: 's3-1', status: 'done', completedBy: 'user-2', completedAt: '2024-08-01T10:00:00.000Z' },
  { id: 'ss-4-s3-2', loanId: 'loan-4', stepId: 's3-2', status: 'done', completedBy: 'user-2', completedAt: '2024-08-05T10:00:00.000Z' },
  { id: 'ss-4-s3-3', loanId: 'loan-4', stepId: 's3-3', status: 'done', completedBy: 'user-2', completedAt: '2024-08-07T10:00:00.000Z' },
  { id: 'ss-4-s3-4', loanId: 'loan-4', stepId: 's3-4', status: 'done', completedBy: 'user-1', completedAt: '2024-08-08T10:00:00.000Z' },
  { id: 'ss-4-s3-5', loanId: 'loan-4', stepId: 's3-5', status: 'done', completedBy: 'user-2', completedAt: '2024-08-09T10:00:00.000Z' },
  { id: 'ss-4-s3-6', loanId: 'loan-4', stepId: 's3-6', status: 'done', completedBy: 'user-1', completedAt: '2024-08-10T10:00:00.000Z' },
  { id: 'ss-4-s3-7', loanId: 'loan-4', stepId: 's3-7', status: 'done', completedBy: 'user-1', completedAt: '2024-08-14T10:00:00.000Z' },
  { id: 'ss-4-s3-8', loanId: 'loan-4', stepId: 's3-8', status: 'done', completedBy: 'user-2', completedAt: '2024-08-16T10:00:00.000Z' },
  { id: 'ss-4-s4-1', loanId: 'loan-4', stepId: 's4-1', status: 'done', completedBy: 'user-2', completedAt: '2024-08-18T10:00:00.000Z' },
  { id: 'ss-4-s4-2', loanId: 'loan-4', stepId: 's4-2', status: 'done', completedBy: 'user-1', completedAt: '2024-08-20T10:00:00.000Z' },
  { id: 'ss-4-s4-3', loanId: 'loan-4', stepId: 's4-3', status: 'done', completedBy: 'user-2', completedAt: '2024-08-25T10:00:00.000Z' },
  { id: 'ss-4-s4-4', loanId: 'loan-4', stepId: 's4-4', status: 'done', completedBy: 'user-1', completedAt: '2024-08-26T10:00:00.000Z' },
  { id: 'ss-4-s5-1', loanId: 'loan-4', stepId: 's5-1', status: 'done', completedBy: 'user-2', completedAt: '2024-09-01T10:00:00.000Z' },
  { id: 'ss-4-s5-2', loanId: 'loan-4', stepId: 's5-2', status: 'done', completedBy: 'user-2', completedAt: '2024-09-01T10:00:00.000Z' },
  { id: 'ss-4-s5-5', loanId: 'loan-4', stepId: 's5-5', status: 'done', completedBy: 'user-2', completedAt: '2024-09-15T10:00:00.000Z' },
  // Now in Special Servicing
  { id: 'ss-4-s6-1',  loanId: 'loan-4', stepId: 's6-1',  status: 'done',     completedBy: 'user-1', completedAt: '2024-10-05T10:00:00.000Z' },
  { id: 'ss-4-s6-1t', loanId: 'loan-4', stepId: 's6-1t', status: 'done',     completedBy: 'user-2', completedAt: '2024-10-05T14:00:00.000Z' },
  { id: 'ss-4-s6-2',  loanId: 'loan-4', stepId: 's6-2',  status: 'done',     completedBy: 'user-1', completedAt: '2024-11-01T10:00:00.000Z' },
  { id: 'ss-4-s6-3',  loanId: 'loan-4', stepId: 's6-3',  status: 'done',     completedBy: 'user-2', completedAt: '2024-12-05T10:00:00.000Z' },
  { id: 'ss-4-s6-d2a',loanId: 'loan-4', stepId: 's6-d2a',status: 'not_done', completedBy: null,     completedAt: null },

  // ── loan-5 (stage-6) — CR LJFB LLC, delinquent ───────────────────────────────
  { id: 'ss-5-s6-1',  loanId: 'loan-5', stepId: 's6-1',  status: 'done',     completedBy: 'user-1', completedAt: '2024-11-15T09:00:00.000Z' },
  { id: 'ss-5-s6-1t', loanId: 'loan-5', stepId: 's6-1t', status: 'done',     completedBy: 'user-2', completedAt: '2024-11-15T15:00:00.000Z' },
  { id: 'ss-5-s6-2',  loanId: 'loan-5', stepId: 's6-2',  status: 'done',     completedBy: 'user-1', completedAt: '2024-12-10T09:00:00.000Z' },
  { id: 'ss-5-s6-3',  loanId: 'loan-5', stepId: 's6-3',  status: 'not_done', completedBy: null,     completedAt: null },

  // ── loan-6 (stage-7, 3 steps) — most done ────────────────────────────────
  { id: 'ss-6-s7-1', loanId: 'loan-6', stepId: 's7-1', status: 'done',     completedBy: 'user-1', completedAt: '2025-01-10T08:00:00.000Z' },
  { id: 'ss-6-s7-2', loanId: 'loan-6', stepId: 's7-2', status: 'done',     completedBy: 'user-2', completedAt: '2025-02-01T08:00:00.000Z' },
  { id: 'ss-6-s7-3', loanId: 'loan-6', stepId: 's7-3', status: 'not_done', completedBy: null,     completedAt: null },

  // ── loan-7 (stage-7, 3 steps) — most done ────────────────────────────────
  { id: 'ss-7-s7-1', loanId: 'loan-7', stepId: 's7-1', status: 'done',     completedBy: 'user-1', completedAt: '2025-01-20T09:00:00.000Z' },
  { id: 'ss-7-s7-2', loanId: 'loan-7', stepId: 's7-2', status: 'done',     completedBy: 'user-3', completedAt: '2025-02-15T09:00:00.000Z' },
  { id: 'ss-7-s7-3', loanId: 'loan-7', stepId: 's7-3', status: 'done',     completedBy: 'user-1', completedAt: '2025-03-01T09:00:00.000Z' },
];

// ─── Comments ─────────────────────────────────────────────────────────────────
// 1 resolved + 1 open per loan, stageId matches loan's stageId

export const SEED_COMMENTS: Comment[] = [
  // loan-1 (stage-1)
  { id: 'comment-1a', loanId: 'loan-1', stageId: 'stage-1', authorId: 'user-1', body: 'Received borrower intake. Rough collateral check looks promising for $75k ask.', resolved: true,  createdAt: '2025-05-01T13:00:00.000Z' },
  { id: 'comment-1b', loanId: 'loan-1', stageId: 'stage-1', authorId: 'user-2', body: 'Need to pull comparable sales before generating the term sheet.', resolved: false, createdAt: '2025-05-03T09:00:00.000Z' },

  // loan-2 (stage-3)
  { id: 'comment-2a', loanId: 'loan-2', stageId: 'stage-3', authorId: 'user-2', body: 'Title opened with Pioneer Title — no issues so far.', resolved: true,  createdAt: '2025-04-18T11:00:00.000Z' },
  { id: 'comment-2b', loanId: 'loan-2', stageId: 'stage-3', authorId: 'user-4', body: 'Outstanding title issue on parcel — waiting on easement release.', resolved: false, createdAt: '2025-05-20T15:00:00.000Z' },

  // loan-3 (stage-3)
  { id: 'comment-3a', loanId: 'loan-3', stageId: 'stage-3', authorId: 'user-3', body: 'All three parcels confirmed by survey; title opened on all.', resolved: true,  createdAt: '2025-04-20T10:00:00.000Z' },
  { id: 'comment-3b', loanId: 'loan-3', stageId: 'stage-3', authorId: 'user-1', body: 'Loan docs still in draft — need Kemper to sign authorization form first.', resolved: false, createdAt: '2025-05-22T16:30:00.000Z' },

  // loan-4 (stage-6)
  { id: 'comment-4a', loanId: 'loan-4', stageId: 'stage-6', authorId: 'user-1', body: 'Personal contact made with borrower. They acknowledged the late payment.', resolved: true,  createdAt: '2024-10-05T11:00:00.000Z' },
  { id: 'comment-4b', loanId: 'loan-4', stageId: 'stage-6', authorId: 'user-5', body: 'Demand letter sent. Awaiting response from law firm on next steps.', resolved: false, createdAt: '2025-05-15T10:00:00.000Z' },

  // loan-5 (stage-6)
  { id: 'comment-5a', loanId: 'loan-5', stageId: 'stage-6', authorId: 'user-1', body: 'Borrower contacted — claimed cash flow issues. Personal contact done.', resolved: true,  createdAt: '2024-11-15T10:00:00.000Z' },
  { id: 'comment-5b', loanId: 'loan-5', stageId: 'stage-6', authorId: 'user-2', body: 'Moving to default — need Ashley to coordinate rate adjustment with NSC.', resolved: false, createdAt: '2025-05-10T12:00:00.000Z' },

  // loan-6 (stage-7)
  { id: 'comment-6a', loanId: 'loan-6', stageId: 'stage-7', authorId: 'user-1', body: 'Engaged foreclosure counsel — Hawkins & Moore LLP confirmed engagement.', resolved: true,  createdAt: '2025-01-10T09:00:00.000Z' },
  { id: 'comment-6b', loanId: 'loan-6', stageId: 'stage-7', authorId: 'user-3', body: 'Collateral inspection scheduled for next week — confirm insurance coverage.', resolved: false, createdAt: '2025-04-01T13:00:00.000Z' },

  // loan-7 (stage-7)
  { id: 'comment-7a', loanId: 'loan-7', stageId: 'stage-7', authorId: 'user-1', body: 'Foreclosure firm retained — Pacific Northwest Legal Group engaged.', resolved: true,  createdAt: '2025-01-20T10:00:00.000Z' },
  { id: 'comment-7b', loanId: 'loan-7', stageId: 'stage-7', authorId: 'user-4', body: 'Ski resort collateral protection review needed before winter season ends.', resolved: false, createdAt: '2025-03-15T15:00:00.000Z' },
];

// ─── Attachments ──────────────────────────────────────────────────────────────
// 2–3 per loan

export const SEED_ATTACHMENTS: Attachment[] = [
  // loan-1
  { id: 'att-1a', loanId: 'loan-1', name: 'Bill Twyford — Drivers License',  kind: 'ID',         status: 'received'  },
  { id: 'att-1b', loanId: 'loan-1', name: 'Conditional Term Sheet',          kind: 'TermSheet',  status: 'requested' },

  // loan-2
  { id: 'att-2a', loanId: 'loan-2', name: 'Deric Outley — Drivers License',  kind: 'ID',         status: 'received'  },
  { id: 'att-2b', loanId: 'loan-2', name: 'Land to Sky — Deed to 60 Acres',  kind: 'Deed',       status: 'received'  },
  { id: 'att-2c', loanId: 'loan-2', name: 'Signed Term Sheet',               kind: 'TermSheet',  status: 'verified'  },

  // loan-3
  { id: 'att-3a', loanId: 'loan-3', name: 'Thomas Kemper — Drivers License', kind: 'ID',         status: 'received'  },
  { id: 'att-3b', loanId: 'loan-3', name: 'Parcel A Deed',                   kind: 'Deed',       status: 'received'  },
  { id: 'att-3c', loanId: 'loan-3', name: 'Term Sheet — Kemper 3 Parcels',   kind: 'TermSheet',  status: 'verified'  },

  // loan-4
  { id: 'att-4a', loanId: 'loan-4', name: 'OH9 Holdings — Operating Agmt',  kind: 'Other',      status: 'verified'  },
  { id: 'att-4b', loanId: 'loan-4', name: '1923 County Rd 202 Deed',         kind: 'Deed',       status: 'verified'  },
  { id: 'att-4c', loanId: 'loan-4', name: 'Settlement Statement',            kind: 'Settlement', status: 'verified'  },

  // loan-5
  { id: 'att-5a', loanId: 'loan-5', name: 'Carlos Rivera — Drivers License', kind: 'ID',         status: 'verified'  },
  { id: 'att-5b', loanId: 'loan-5', name: 'Stoney Mountain Rd Deed',         kind: 'Deed',       status: 'verified'  },
  { id: 'att-5c', loanId: 'loan-5', name: 'Settlement Statement — CR LJFB',  kind: 'Settlement', status: 'verified'  },

  // loan-6
  { id: 'att-6a', loanId: 'loan-6', name: 'Wabash Crossing Deed',            kind: 'Deed',       status: 'verified'  },
  { id: 'att-6b', loanId: 'loan-6', name: 'Settlement Statement — Wabash',   kind: 'Settlement', status: 'verified'  },
  { id: 'att-6c', loanId: 'loan-6', name: 'Foreclosure Engagement Letter',   kind: 'Other',      status: 'received'  },

  // loan-7
  { id: 'att-7a', loanId: 'loan-7', name: 'Ski Resort Chewelah Deed',        kind: 'Deed',       status: 'verified'  },
  { id: 'att-7b', loanId: 'loan-7', name: 'Settlement Statement — Chewelah', kind: 'Settlement', status: 'verified'  },
  { id: 'att-7c', loanId: 'loan-7', name: 'Foreclosure Firm Engagement Ltr', kind: 'Other',      status: 'received'  },
];
