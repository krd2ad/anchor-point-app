import type { ExternalParty } from '../types';

export const EXTERNAL_PARTIES: ExternalParty[] = [
  {
    id: 'party-nsc',
    type: 'servicer',
    name: 'Note Servicing Center (NSC)',
    phone: '(800) 646-3445',
    email: 'office@noteservicingcenter.com',
    notes: 'Primary loan servicer. Handles payment processing, escrow, and borrower account setup.',
  },
  {
    id: 'party-titan',
    type: 'bank',
    name: 'Titan Bank',
    notes: 'Funding and payoff destination. Confirm funds clear Titan Bank on payoff.',
  },
  {
    id: 'party-ethan-firm',
    type: 'law_firm',
    name: "Ethan's Law Firm",
    notes: 'Foreclosure and default counsel. Placeholder — confirm firm name and contact.',
  },
  {
    id: 'party-pioneer-title',
    type: 'title',
    name: 'Pioneer Title Company',
    phone: '(800) 555-0191',
    email: 'closings@pioneertitle.example.com',
    notes: 'Title company used for TX/IA closings.',
  },
  {
    id: 'party-summit-title',
    type: 'title',
    name: 'Summit Title & Escrow',
    phone: '(800) 555-0242',
    email: 'orders@summittitle.example.com',
    notes: 'Title company used for PA/WA/IL closings.',
  },
  {
    id: 'party-apex-inspect',
    type: 'inspector',
    name: 'Apex Property Inspections',
    phone: '(888) 555-0310',
    email: 'draws@apexinspect.example.com',
    notes: 'Draw inspection firm for construction/rehab loans.',
  },
];
