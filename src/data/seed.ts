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
    titleCompanyId: 'party-pioneer-title',
    loanPosition: 'First Lien',
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
    titleCompanyId: 'party-pioneer-title',
    loanPosition: 'First Lien',
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
// Comprehensive per-loan document sets with real taxonomy.
// Status matches stage: stage-6/7 → mostly verified; stage-3 → mix received/requested; stage-1 → requested

export const SEED_ATTACHMENTS: Attachment[] = [
  // ── loan-1 (stage-1, New Intake) — early funnel, only a few requested ─────────
  {
    id: 'att-1a', loanId: 'loan-1',
    name: 'Government-Issued ID – Bill Twyford',
    kind: 'ID', status: 'requested',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 320000, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-1b', loanId: 'loan-1',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'requested',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-1c', loanId: 'loan-1',
    name: 'Personal Financial Statement',
    kind: 'Other', status: 'requested',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },

  // ── loan-2 (stage-3, Title & Closing) — mix of received/requested ───────────
  {
    id: 'att-2a', loanId: 'loan-2',
    name: 'Government-Issued ID – Deric Outley',
    kind: 'ID', status: 'received',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 415000, uploadedAt: '2025-04-11T09:15:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-2b', loanId: 'loan-2',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 520000, uploadedAt: '2025-04-12T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-2c', loanId: 'loan-2',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 285000, uploadedAt: '2025-04-14T14:30:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-2d', loanId: 'loan-2',
    name: 'Entity Documents – Land to Sky Realty LLC',
    kind: 'Other', status: 'received',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 640000, uploadedAt: '2025-04-13T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-2e', loanId: 'loan-2',
    name: 'Title Commitment / Report',
    kind: 'Deed', status: 'received',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 890000, uploadedAt: '2025-04-20T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-2f', loanId: 'loan-2',
    name: 'Wire Instructions',
    kind: 'Other', status: 'requested',
    category: 'Title', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-2g', loanId: 'loan-2',
    name: 'Secured Note',
    kind: 'Other', status: 'requested',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-2h', loanId: 'loan-2',
    name: 'Bank Statements – Last 2 Months',
    kind: 'Other', status: 'received',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 1250000, uploadedAt: '2025-04-15T13:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-2i', loanId: 'loan-2',
    name: 'Appraisal',
    kind: 'Other', status: 'received',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 3400000, uploadedAt: '2025-04-28T10:00:00.000Z', uploadedById: 'user-1',
  },

  // ── loan-3 (stage-3, Title & Closing) — mix, partial folders ────────────────
  {
    id: 'att-3a', loanId: 'loan-3',
    name: 'Government-Issued ID – Thomas Kemper',
    kind: 'ID', status: 'received',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 388000, uploadedAt: '2025-04-16T08:30:00.000Z', uploadedById: 'user-3',
  },
  {
    id: 'att-3b', loanId: 'loan-3',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 498000, uploadedAt: '2025-04-17T11:00:00.000Z', uploadedById: 'user-3',
  },
  {
    id: 'att-3c', loanId: 'loan-3',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 302000, uploadedAt: '2025-04-19T14:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-3d', loanId: 'loan-3',
    name: 'Tax Returns',
    kind: 'Other', status: 'received',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 2100000, uploadedAt: '2025-04-18T09:00:00.000Z', uploadedById: 'user-3',
  },
  {
    id: 'att-3e', loanId: 'loan-3',
    name: 'Title Commitment / Report – 3 Parcels',
    kind: 'Deed', status: 'received',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 1450000, uploadedAt: '2025-04-22T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-3f', loanId: 'loan-3',
    name: 'Personal Guaranty',
    kind: 'Other', status: 'requested',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-3g', loanId: 'loan-3',
    name: 'ACH Authorization',
    kind: 'Other', status: 'requested',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },
  {
    id: 'att-3h', loanId: 'loan-3',
    name: 'Closing Protection Letter – CPL',
    kind: 'Other', status: 'requested',
    category: 'Title', fileType: 'pdf',
    sizeBytes: undefined, uploadedAt: undefined, uploadedById: undefined,
  },

  // ── loan-4 (stage-6, Special Servicing) — mostly verified, with draws ───────
  {
    id: 'att-4a', loanId: 'loan-4',
    name: 'Government-Issued ID – James Holder',
    kind: 'ID', status: 'verified',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 425000, uploadedAt: '2024-07-22T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4b', loanId: 'loan-4',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 510000, uploadedAt: '2024-07-23T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4c', loanId: 'loan-4',
    name: 'Entity Documents – OH9 Holdings LLC',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 720000, uploadedAt: '2024-07-24T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4d', loanId: 'loan-4',
    name: 'Appraisal – 1923 County Rd 202',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 4200000, uploadedAt: '2024-07-26T13:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4e', loanId: 'loan-4',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 290000, uploadedAt: '2024-07-28T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4f', loanId: 'loan-4',
    name: 'Secured Note',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 185000, uploadedAt: '2024-08-10T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4g', loanId: 'loan-4',
    name: 'Deed of Trust / Mortgage',
    kind: 'Deed', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 340000, uploadedAt: '2024-08-12T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4h', loanId: 'loan-4',
    name: 'Title Commitment / Report',
    kind: 'Deed', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 980000, uploadedAt: '2024-08-05T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4i', loanId: 'loan-4',
    name: 'Closing Protection Letter – CPL',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 220000, uploadedAt: '2024-08-06T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4j', loanId: 'loan-4',
    name: 'Wire Instructions',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 95000, uploadedAt: '2024-08-08T14:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4k', loanId: 'loan-4',
    name: 'Recorded Deed of Trust',
    kind: 'Deed', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 410000, uploadedAt: '2024-08-20T09:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4l', loanId: 'loan-4',
    name: 'Final Settlement Statement / ALTA-CD',
    kind: 'Settlement', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 650000, uploadedAt: '2024-08-21T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4m', loanId: 'loan-4',
    name: 'NSC Setup Form',
    kind: 'Other', status: 'verified',
    category: 'NSC', fileType: 'pdf',
    sizeBytes: 180000, uploadedAt: '2024-08-25T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4n', loanId: 'loan-4',
    name: 'Hazard / Fire Policy – APL as Mortgagee',
    kind: 'Other', status: 'verified',
    category: 'Insurance', fileType: 'pdf',
    sizeBytes: 760000, uploadedAt: '2024-08-22T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-4o', loanId: 'loan-4',
    name: 'Draw Request – Draw 1',
    kind: 'Other', status: 'verified',
    category: 'Draw', fileType: 'pdf',
    sizeBytes: 210000, uploadedAt: '2024-10-15T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-4p', loanId: 'loan-4',
    name: 'Inspection Report – Draw 1',
    kind: 'Other', status: 'verified',
    category: 'Draw', fileType: 'pdf',
    sizeBytes: 1850000, uploadedAt: '2024-10-14T14:00:00.000Z', uploadedById: 'user-3',
  },
  {
    id: 'att-4q', loanId: 'loan-4',
    name: 'Background Check',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 320000, uploadedAt: '2024-07-25T10:00:00.000Z', uploadedById: 'user-1',
  },

  // ── loan-5 (stage-6, Special Servicing) — mostly verified ────────────────────
  {
    id: 'att-5a', loanId: 'loan-5',
    name: 'Government-Issued ID – Carlos Rivera',
    kind: 'ID', status: 'verified',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 398000, uploadedAt: '2024-08-29T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5b', loanId: 'loan-5',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 490000, uploadedAt: '2024-08-30T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5c', loanId: 'loan-5',
    name: 'Entity Documents – CR LJFB LLC',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 680000, uploadedAt: '2024-08-31T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5d', loanId: 'loan-5',
    name: 'Appraisal – Stoney Mountain Rd',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 3800000, uploadedAt: '2024-09-03T13:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5e', loanId: 'loan-5',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 275000, uploadedAt: '2024-09-06T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5f', loanId: 'loan-5',
    name: 'Secured Note',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 195000, uploadedAt: '2024-09-15T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5g', loanId: 'loan-5',
    name: 'Deed of Trust / Mortgage',
    kind: 'Deed', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 360000, uploadedAt: '2024-09-16T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5h', loanId: 'loan-5',
    name: 'Title Commitment / Report',
    kind: 'Deed', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 920000, uploadedAt: '2024-09-10T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5i', loanId: 'loan-5',
    name: 'Closing Protection Letter – CPL',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 215000, uploadedAt: '2024-09-11T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5j', loanId: 'loan-5',
    name: 'Recorded Deed of Trust',
    kind: 'Deed', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 420000, uploadedAt: '2024-09-25T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-5k', loanId: 'loan-5',
    name: 'Final Settlement Statement / ALTA-CD',
    kind: 'Settlement', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 610000, uploadedAt: '2024-09-26T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5l', loanId: 'loan-5',
    name: 'NSC Setup Form',
    kind: 'Other', status: 'verified',
    category: 'NSC', fileType: 'pdf',
    sizeBytes: 175000, uploadedAt: '2024-09-28T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-5m', loanId: 'loan-5',
    name: 'Hazard / Fire Policy – APL as Mortgagee',
    kind: 'Other', status: 'verified',
    category: 'Insurance', fileType: 'pdf',
    sizeBytes: 740000, uploadedAt: '2024-09-24T09:00:00.000Z', uploadedById: 'user-1',
  },

  // ── loan-6 (stage-7, Foreclosure) — fully verified ───────────────────────────
  {
    id: 'att-6a', loanId: 'loan-6',
    name: 'Government-Issued ID – Nathan Cross',
    kind: 'ID', status: 'verified',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 412000, uploadedAt: '2024-04-21T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6b', loanId: 'loan-6',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 505000, uploadedAt: '2024-04-22T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6c', loanId: 'loan-6',
    name: 'Entity Documents – Wabash Crossing LLC',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 690000, uploadedAt: '2024-04-23T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6d', loanId: 'loan-6',
    name: 'Appraisal – Wabash Crossing Development',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 3600000, uploadedAt: '2024-04-25T13:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6e', loanId: 'loan-6',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 280000, uploadedAt: '2024-04-27T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6f', loanId: 'loan-6',
    name: 'Secured Note',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 190000, uploadedAt: '2024-05-10T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6g', loanId: 'loan-6',
    name: 'Deed of Trust / Mortgage',
    kind: 'Deed', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 355000, uploadedAt: '2024-05-12T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6h', loanId: 'loan-6',
    name: 'Personal Guaranty',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 210000, uploadedAt: '2024-05-12T12:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6i', loanId: 'loan-6',
    name: 'Title Commitment / Report',
    kind: 'Deed', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 940000, uploadedAt: '2024-05-05T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6j', loanId: 'loan-6',
    name: 'Closing Protection Letter – CPL',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 225000, uploadedAt: '2024-05-06T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6k', loanId: 'loan-6',
    name: 'E&O Dec Page',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 310000, uploadedAt: '2024-05-07T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6l', loanId: 'loan-6',
    name: 'Recorded Deed of Trust',
    kind: 'Deed', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 430000, uploadedAt: '2024-05-20T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6m', loanId: 'loan-6',
    name: 'Final Lender\'s Title Policy',
    kind: 'Other', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 570000, uploadedAt: '2024-05-20T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6n', loanId: 'loan-6',
    name: 'Final Settlement Statement / ALTA-CD',
    kind: 'Settlement', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 620000, uploadedAt: '2024-05-21T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-6o', loanId: 'loan-6',
    name: 'NSC Setup Form',
    kind: 'Other', status: 'verified',
    category: 'NSC', fileType: 'pdf',
    sizeBytes: 180000, uploadedAt: '2024-05-22T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-6p', loanId: 'loan-6',
    name: 'Hazard / Fire Policy – APL as Mortgagee',
    kind: 'Other', status: 'verified',
    category: 'Insurance', fileType: 'pdf',
    sizeBytes: 750000, uploadedAt: '2024-05-19T09:00:00.000Z', uploadedById: 'user-1',
  },

  // ── loan-7 (stage-7, Foreclosure) — fully verified ───────────────────────────
  {
    id: 'att-7a', loanId: 'loan-7',
    name: 'Government-Issued ID – Sandra Petrov',
    kind: 'ID', status: 'verified',
    category: 'Underwriting', fileType: 'jpg',
    sizeBytes: 401000, uploadedAt: '2024-05-26T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7b', loanId: 'loan-7',
    name: 'Tri-Merge Credit Report',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 512000, uploadedAt: '2024-05-27T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7c', loanId: 'loan-7',
    name: 'Entity Documents – Ski Resort Chewelah Corp',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 705000, uploadedAt: '2024-05-28T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7d', loanId: 'loan-7',
    name: 'Appraisal – Ski Resort Access Rd, Chewelah',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 5100000, uploadedAt: '2024-05-30T13:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7e', loanId: 'loan-7',
    name: 'Personal Financial Statement',
    kind: 'Other', status: 'verified',
    category: 'Underwriting', fileType: 'pdf',
    sizeBytes: 380000, uploadedAt: '2024-05-29T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7f', loanId: 'loan-7',
    name: 'Conditional Term Sheet',
    kind: 'TermSheet', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 295000, uploadedAt: '2024-06-02T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7g', loanId: 'loan-7',
    name: 'Secured Note',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 200000, uploadedAt: '2024-06-15T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7h', loanId: 'loan-7',
    name: 'Deed of Trust / Mortgage',
    kind: 'Deed', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 370000, uploadedAt: '2024-06-16T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7i', loanId: 'loan-7',
    name: 'Loan Agreement',
    kind: 'Other', status: 'verified',
    category: 'Loan Docs', fileType: 'pdf',
    sizeBytes: 450000, uploadedAt: '2024-06-16T12:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7j', loanId: 'loan-7',
    name: 'Title Commitment / Report',
    kind: 'Deed', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 960000, uploadedAt: '2024-06-10T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7k', loanId: 'loan-7',
    name: 'Closing Protection Letter – CPL',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 230000, uploadedAt: '2024-06-11T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7l', loanId: 'loan-7',
    name: 'Wire Instructions',
    kind: 'Other', status: 'verified',
    category: 'Title', fileType: 'pdf',
    sizeBytes: 98000, uploadedAt: '2024-06-12T14:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7m', loanId: 'loan-7',
    name: 'Recorded Deed of Trust',
    kind: 'Deed', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 440000, uploadedAt: '2024-06-25T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7n', loanId: 'loan-7',
    name: 'Final Lender\'s Title Policy',
    kind: 'Other', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 580000, uploadedAt: '2024-06-25T10:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7o', loanId: 'loan-7',
    name: 'Final Settlement Statement / ALTA-CD',
    kind: 'Settlement', status: 'verified',
    category: 'Final Loan Docs', fileType: 'pdf',
    sizeBytes: 630000, uploadedAt: '2024-06-26T10:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7p', loanId: 'loan-7',
    name: 'NSC Setup Form',
    kind: 'Other', status: 'verified',
    category: 'NSC', fileType: 'pdf',
    sizeBytes: 175000, uploadedAt: '2024-06-28T11:00:00.000Z', uploadedById: 'user-2',
  },
  {
    id: 'att-7q', loanId: 'loan-7',
    name: 'Hazard / Fire Policy – APL as Mortgagee',
    kind: 'Other', status: 'verified',
    category: 'Insurance', fileType: 'pdf',
    sizeBytes: 760000, uploadedAt: '2024-06-24T09:00:00.000Z', uploadedById: 'user-1',
  },
  {
    id: 'att-7r', loanId: 'loan-7',
    name: 'Flood Insurance',
    kind: 'Other', status: 'verified',
    category: 'Insurance', fileType: 'pdf',
    sizeBytes: 480000, uploadedAt: '2024-06-24T10:00:00.000Z', uploadedById: 'user-2',
  },
];
