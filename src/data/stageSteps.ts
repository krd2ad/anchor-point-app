import type { StageStep } from '../types';

export const STAGE_STEPS: StageStep[] = [
  // Stage 1 — Loan Funnel
  { id: 's1-1', stageId: 'stage-1', order: 1, label: 'Draft Loan Card' },
  { id: 's1-2', stageId: 'stage-1', order: 2, label: 'Rough Underwriting of Collateral' },
  { id: 's1-3', stageId: 'stage-1', order: 3, label: 'Ready to Generate Term Sheet' },
  { id: 's1-4', stageId: 'stage-1', order: 4, label: 'Send Conditional Term Sheet (pre-underwriting)' },

  // Stage 2 — Processing / Underwriting
  { id: 's2-1', stageId: 'stage-2', order: 1, label: 'Request Underwriting Document Package' },
  { id: 's2-2', stageId: 'stage-2', order: 2, label: '(1a) Kick off Draw Program' },
  { id: 's2-3', stageId: 'stage-2', order: 3, label: 'Underwriting of Collateral and Borrower' },
  { id: 's2-4', stageId: 'stage-2', order: 4, label: '(2A) Loan Folder QC and Sign-off, Loan Card Standardization QC' },
  { id: 's2-5', stageId: 'stage-2', order: 5, label: 'Ready for Loan Docs' },
  { id: 's2-6', stageId: 'stage-2', order: 6, label: 'Draw Program Approved' },

  // Stage 3 — Title & Closing
  { id: 's3-1', stageId: 'stage-3', order: 1, label: 'Title Opened' },
  { id: 's3-2', stageId: 'stage-3', order: 2, label: 'Title Issues Pending' },
  { id: 's3-3', stageId: 'stage-3', order: 3, label: 'Loan Docs Drafting' },
  { id: 's3-4', stageId: 'stage-3', order: 4, label: 'Wiring Instructions Verified' },
  { id: 's3-5', stageId: 'stage-3', order: 5, label: 'Settlement Statement Review' },
  { id: 's3-6', stageId: 'stage-3', order: 6, label: 'Final Closing Checklist Completed' },
  { id: 's3-7', stageId: 'stage-3', order: 7, label: '(6A) Loan Folder QC for complete information package and portfolio update' },
  { id: 's3-8', stageId: 'stage-3', order: 8, label: 'Ready to Fund' },
  { id: 's3-9', stageId: 'stage-3', order: 9, label: 'Funded (awaiting…)' },

  // Stage 4 — Servicing Setup
  { id: 's4-1', stageId: 'stage-4', order: 1, label: 'Funded — Ready to Submit to Servicing' },
  { id: 's4-2', stageId: 'stage-4', order: 2, label: 'Service Information Input (Rivers to approve)' },
  { id: 's4-3', stageId: 'stage-4', order: 3, label: 'Submitted to Servicing (wait for NSC to confirm)' },
  { id: 's4-4', stageId: 'stage-4', order: 4, label: 'Final Document Package Check in NSC System (Rivers to approve)' },
  { id: 's4-5', stageId: 'stage-4', order: 5, label: 'Receive DOT from Title and Update to NSC' },

  // Stage 5 — Collecting
  { id: 's5-1', stageId: 'stage-5', order: 1, label: 'NSC Account Set Up (due 1st / 10th / 20th of the closing month)' },
  { id: 's5-2', stageId: 'stage-5', order: 2, label: 'Auto Pay Set Up' },
  { id: 's5-3', stageId: 'stage-5', order: 3, label: '(1A) Set Up — Waiting for First Payment' },
  { id: 's5-4', stageId: 'stage-5', order: 4, label: '(1B) First Payment Late (0–10 days)' },
  { id: 's5-5', stageId: 'stage-5', order: 5, label: '(1C) First Payment Late (11–20 days)' },
  { id: 's5-6', stageId: 'stage-5', order: 6, label: 'Collecting / Performing' },

  // Stage 6 — Special Servicing
  { id: 's6-1', stageId: 'stage-6', order: 1, label: '(1A) Late Payment — Personal Contact (10 day)' },
  { id: 's6-2', stageId: 'stage-6', order: 2, label: '(1B2) After 20 Days — Move to Default (adjust interest rate with NSC)' },
  { id: 's6-3', stageId: 'stage-6', order: 3, label: '(1C) After 30 Days — Email Borrower & Demand Letter from Law Firm' },
  { id: 's6-4', stageId: 'stage-6', order: 4, label: '(2A) Draw Requested' },

  // Stage 7 — Foreclosure
  { id: 's7-1', stageId: 'stage-7', order: 1, label: 'Foreclosure Law Firm Engagement Period' },
  { id: 's7-2', stageId: 'stage-7', order: 2, label: 'Default Notice Sent' },
  { id: 's7-3', stageId: 'stage-7', order: 3, label: 'Collateral Protection Needed?' },
];
