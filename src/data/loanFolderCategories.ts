import type { AttachmentCategory } from '../types';

export const LOAN_FOLDER_CATEGORIES: AttachmentCategory[] = [
  'Underwriting',
  'Loan Docs',
  'Title',
  'Final Loan Docs',
  'NSC',
  'Insurance',
  'Draw',
];

// Typical/expected documents per category — used for "No documents yet" hints
export const CATEGORY_EXPECTED_DOCS: Record<AttachmentCategory, string[]> = {
  Underwriting: [
    'Government-Issued ID',
    'Tri-Merge Credit Report',
    'Personal Financial Statement / Net Worth',
    'Bank Statements – Last 2 Months',
    'Tax Returns',
    'Entity Documents',
    'Signing Authority',
    'Appraisal',
    'ACH Authorization',
    'Background Check',
  ],
  'Loan Docs': [
    'Conditional Term Sheet',
    'Secured Note',
    'Deed of Trust / Mortgage',
    'Loan Agreement',
    'Personal Guaranty',
  ],
  Title: [
    'Title Commitment / Report',
    'Closing Protection Letter – CPL',
    'E&O Dec Page',
    'Wire Instructions',
  ],
  'Final Loan Docs': [
    'Recorded Deed of Trust',
    'Final Lender\'s Title Policy',
    'Final Settlement Statement / ALTA-CD',
  ],
  NSC: [
    'NSC Setup Form',
    'Payoff Statement',
  ],
  Insurance: [
    'Hazard / Fire Policy – APL as Mortgagee',
    'Flood Insurance',
  ],
  Draw: [
    'Draw Request',
    'Inspection Report',
    'Receipts / Proof of Funds',
    'Permits',
  ],
};
