import type { Loan, Stage } from '../types';

function esc(v: string | number | boolean | null | undefined): string {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportLoansAsCsv(loans: Loan[], stages: Stage[]): void {
  const stageMap = new Map(stages.map(s => [s.id, s.name]));

  const headers = [
    'ID', 'Display Label', 'Stage', 'Lending Entity', 'Loan Amount',
    'Current Balance', 'Interest Rate %', 'LTV %', 'Servicer',
    'Origination Date', 'Closing Date', 'Funded Date', 'First Payment Date',
    'Payment Due Day', 'Auto Pay', 'Loan Position', 'Referral Partner',
    'Created At', 'Updated At',
  ];

  const rows = loans.map(l => [
    esc(l.id),
    esc(l.displayLabel),
    esc(stageMap.get(l.stageId) ?? l.stageId),
    esc(l.lendingEntity),
    esc(l.loanAmount),
    esc(l.currentBalance),
    esc(l.interestRate),
    esc(l.computedLtv != null ? (l.computedLtv * 100).toFixed(1) : ''),
    esc(l.servicer),
    esc(l.originationDate),
    esc(l.closingDate),
    esc(l.fundedDate),
    esc(l.firstPaymentDate),
    esc(l.paymentDueDay),
    esc(l.autoPayEnabled),
    esc(l.loanPosition ?? ''),
    esc(l.referralPartner ?? ''),
    esc(l.createdAt),
    esc(l.updatedAt),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anchor-point-loans-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
