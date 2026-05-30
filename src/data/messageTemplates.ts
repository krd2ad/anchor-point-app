import type { MessageTemplate } from '../types';

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'term_sheet_cover',
    name: 'Conditional Term Sheet Cover',
    channel: 'email',
    subject: 'Conditional Term Sheet',
    body: `Dear [Borrower First Name],

Please see attached conditional term sheet. We will also be sending a copy for electronic signature through DocuSeal. Let us know if you have any questions.`,
    mergeFields: ['Borrower First Name'],
  },
  {
    id: 'doc_request',
    name: 'Underwriting Document Package Request',
    channel: 'email',
    subject: 'Document Package Request — [Property Address]',
    body: `Dear [Borrower First Name],

Thank you for your interest in financing with Anchor Point Lending. To proceed with underwriting, we will need the following documents:

- Two forms of government-issued ID
- Last 2 years of tax returns (personal and entity)
- Last 3 months of bank statements
- Entity documents (operating agreement, articles of organization)
- Property information and any existing appraisals or valuations

Please send all documents to your loan contact at your earliest convenience. Feel free to reach out with any questions.`,
    mergeFields: ['Borrower First Name', 'Property Address'],
  },
  {
    id: 'nsc_welcome',
    name: 'NSC Welcome / First Payment Notice',
    channel: 'email',
    subject: 'First Loan Payment Action Required',
    body: `Dear [Borrower First Name],

We hope you are doing well and are excited to have closed this loan with you.

We are utilizing Note Servicing Center (NSC) to service this loan. NSC reached out to you with the welcome package to initiate setup of your servicing account.

NSC: (800) 646-3445 | office@noteservicingcenter.com

Your first payment is due on the [Payment Day]. Timely setup ensures smooth processing of your upcoming payments. Please contact NSC directly to complete your account setup and confirm your payment method.

Please don't hesitate to reach out if you have any questions.`,
    mergeFields: ['Borrower First Name', 'Payment Day'],
  },
  {
    id: 'late_10day',
    name: 'First Payment Late — 10 Day Notice',
    channel: 'email',
    subject: 'First Loan Payment Action Required',
    body: `Dear [Borrower First Name],

We are writing to follow up regarding your payment due on [Payment Day], which has not yet been received by Note Servicing Center (NSC).

If payment has already been submitted, please confirm directly with NSC:
(800) 646-3445 | office@noteservicingcenter.com

Kindly confirm receipt and advise when payment will be submitted.`,
    mergeFields: ['Borrower First Name', 'Payment Day'],
  },
  {
    id: 'late_escalation_1',
    name: 'First Payment Late — Escalation 1 (15th–17th)',
    channel: 'email',
    subject: 'First Loan Payment Action Required',
    body: `Dear [Borrower First Name],

As of today, your loan is past due. We ask that you please remit payment as soon as possible to bring the account current. Continued non-payment may result in additional charges pursuant to the terms of your loan documents.

Please confirm: (1) when payment will be submitted, (2) the expected method of payment.`,
    mergeFields: ['Borrower First Name'],
  },
  {
    id: 'late_escalation_2',
    name: 'First Payment Late — Escalation 2 (20th)',
    channel: 'email',
    subject: 'First Loan Payment Action Required',
    body: `Dear [Borrower First Name],

Your payment remains outstanding despite prior notices. This continued delinquency places your loan at risk of formal default.

Possible actions include: default interest, additional late fees, recovery of enforcement and legal costs, and exercise of remedies under your loan documents.

Please confirm your payment status today.`,
    mergeFields: ['Borrower First Name'],
  },
  {
    id: 'special_personal_contact_email',
    name: 'Special Servicing — Personal Contact (Email)',
    channel: 'email',
    subject: 'First Loan Payment Action Required',
    body: `Dear [Borrower First Name],

We are writing to follow up regarding your payment due on [Payment Day], which has not yet been received by Note Servicing Center (NSC).

If payment has already been submitted, please confirm directly with NSC:
(800) 646-3445 | office@noteservicingcenter.com

Kindly confirm receipt and advise when payment will be submitted.`,
    mergeFields: ['Borrower First Name', 'Payment Day'],
  },
  {
    id: 'special_personal_contact_text',
    name: 'Special Servicing — Personal Contact (Text)',
    channel: 'text',
    body: `This is Camila with Anchor Point Lending. We've sent an email today regarding your loan delinquency. Please review and confirm receipt today. Please respond to the email with your plan to address your delinquency.`,
    mergeFields: [],
  },
  {
    id: 'default_notice',
    name: 'Formal Default Notice',
    channel: 'email',
    subject: 'Loan in Default',
    body: `Dear [Borrower First Name],

Your payment remains outstanding despite prior notices. This continued delinquency places your loan into formal default under the terms of your Loan Documents.

Possible actions include: default interest rate adjustment, additional late fees, recovery of enforcement and legal costs, and exercise of all remedies available under your loan documents.

Please confirm your payment status today.`,
    mergeFields: ['Borrower First Name'],
  },
  {
    id: 'demand_letter_request',
    name: 'Demand Letter Request to Law Firm',
    channel: 'email',
    subject: 'Demand Letter Request — [Property Address]',
    body: `Hi [Law Firm Contact],

We would like to request that the main default notice letter be sent for the loan on [Property Address]. The [Month Day, Year] payment was missed, along with all subsequent payments. Default interest started accruing on [Month Day, Year].

We extended a [number]-day grace period prior to default interest. Attached are the signed final loan documents and the loan history. Please email the letter to [Email Addresses].`,
    mergeFields: ['Law Firm Contact', 'Property Address', 'Month Day, Year', 'number', 'Email Addresses'],
  },
  {
    id: 'payoff_approval',
    name: 'Payoff Statement Approval to NSC',
    channel: 'email',
    subject: 'Payoff Statement Approval — [Property Address]',
    // DRAFT — confirm final wording with Rivers/team before use. SOP note: "NEED A COPY AND PASTE STANDARD EMAIL HERE."
    body: `Hi NSC,

Please see our approval for the payoff statement on the loan secured by [Property Address].

We have reviewed the payoff figures and confirm the following must be included:
- Exit fee per the loan documents
- 6-month minimum interest (if applicable under loan terms)
- Lien release fee

Please ensure all amounts reflect these items before issuing the final payoff statement to the borrower and title company.

Once confirmed, please share the approved payoff statement with the borrower and the title company handling the closing.

Thank you,
Anchor Point Lending`,
    mergeFields: ['Property Address'],
  },
];
