import type { AttachmentCategory } from '../types';

// ─── Hierarchy definition ─────────────────────────────────────────────────────
// Single source of truth for folder structure, labels, and expected documents.
// Challenges applied vs. the Google Drive template spec:
//   1. Combined servicing folder labelled "4." (not "4,5,6.") — it is the 4th of
//      6 sequential top-level folders; Foreclosure becomes "5.", Paid Off "6."
//   2. Sub-stage numbering starts at 1 (spec skipped to 2) — "1. NSC" added to
//      house the NSC Master Agreement and complete the 1–5 sequence.
//   3. Final Loan Docs merged into Loan Documents — Archive subfolder handles
//      draft vs. final versioning per the spec's own Archive convention.
//   4. No parent-level marker doc for "3. Title and Closing" — formally exempt;
//      files only live in the Title and Loan Documents subfolders.

export interface StageFolderGroup {
  stageLabel: string;
  categories: { label: string; category: AttachmentCategory }[];
}

export const FOLDER_HIERARCHY: StageFolderGroup[] = [
  {
    stageLabel: '1. Loan Intake',
    categories: [
      { label: '1. Loan Intake', category: 'Loan Intake' },
    ],
  },
  {
    stageLabel: '2. Processing / Underwriting',
    categories: [
      { label: '2. Processing / Underwriting', category: 'Processing / Underwriting' },
    ],
  },
  {
    stageLabel: '3. Title and Closing',
    categories: [
      { label: 'Title', category: 'Title' },
      { label: 'Loan Documents', category: 'Loan Documents' },
    ],
  },
  {
    stageLabel: '4. Servicing and Special Servicing',
    categories: [
      { label: '1. NSC', category: 'NSC' },
      { label: '2. Draws', category: 'Draws' },
      { label: '3. Extensions', category: 'Extensions' },
      { label: '4. Insurance', category: 'Insurance' },
      { label: '5. Tax', category: 'Tax' },
    ],
  },
  {
    stageLabel: '5. Default / Foreclosure',
    categories: [
      { label: 'Foreclosure', category: 'Default / Foreclosure' },
      { label: 'Attorney Correspondence', category: 'Attorney Correspondence' },
    ],
  },
  {
    stageLabel: '6. Complete / Paid Off',
    categories: [
      { label: '6. Complete / Paid Off', category: 'Complete / Paid Off' },
    ],
  },
];

// Flat ordered list of all leaf categories — used by the file tree builder
export const LOAN_FOLDER_CATEGORIES: AttachmentCategory[] = FOLDER_HIERARCHY.flatMap(
  g => g.categories.map(c => c.category),
);

// Display label for each category (e.g. 'NSC' → '1. NSC')
export const CATEGORY_LABEL: Record<AttachmentCategory, string> = Object.fromEntries(
  FOLDER_HIERARCHY.flatMap(g => g.categories.map(c => [c.category, c.label])),
) as Record<AttachmentCategory, string>;

// Expected documents per leaf category — verbatim from the spec's marker docs
export const CATEGORY_EXPECTED_DOCS: Record<AttachmentCategory, string[]> = {
  'Loan Intake': [
    'Application',
    'Term Sheet',
    'Initial Intake Email',
  ],
  'Processing / Underwriting': [
    'Underwriting Document Checklist',
    'Net Worth Statement',
    'Photo ID',
    'Title Report',
    'Credit Report',
    'Tax Returns',
    'Pay Stubs / W-2 (if applicable)',
    'Personal and/or Business Bank Statements',
    'Entity Documents (if applicable)',
    'Signing Authority Documentation',
    'Appraisal (if available)',
    'Inspection Report (if available)',
    'Purchase Contract (if available)',
    'Sale Contract (if available)',
    'Recent Settlement Statement (if applicable)',
    'Environmental Phase 1',
    'Construction Schedule',
    'Construction Budget',
    'Survey',
    'Proforma',
    'Background Check',
  ],
  Title: [
    'Title Commitment',
    'Title Policy',
    'Closing Protection Letter',
    'Wire Instructions',
    'AI Title Report Cheatsheet',
  ],
  'Loan Documents': [
    'Prelim Settlement Statement',
    'Final Settlement Statement',
    'Draft Loan Documents',
    'Final Loan Document Package',
    'Initial Insurance',
    'Recorded DOT / Mortgage',
    'Time Bank Assignment',
    'AI Loan Document Cheatsheet',
  ],
  NSC: [
    'NSC Master Agreement',
  ],
  Draws: [
    'Draw Schedule',
    'Draw Budget (APL Workbook Template)',
    'Wire Instructions',
    'Construction Schedule',
  ],
  Extensions: [
    'Signed Extension',
  ],
  Insurance: [
    'Certificate of Insurance (COI)',
  ],
  Tax: [
    'Annual Property Tax Payment Confirmation',
  ],
  'Default / Foreclosure': [
    'Demand Letter',
    'Notice of Foreclosure',
    'Proof of Insurance Coverage',
    'Proof of Tax Payments',
  ],
  'Attorney Correspondence': [],
  'Complete / Paid Off': [
    'Payoff Letter from NSC',
    'Final Settlement',
    'Reconveyance / Release of Lien',
  ],
};
