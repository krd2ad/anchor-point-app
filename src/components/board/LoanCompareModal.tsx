import { useEffect, useRef, useState } from 'react';
import { useLoanService } from '../../context/LoanServiceProvider';
import type { LoanDetail, UnderwritingScorecard } from '../../types';

interface LoanCompareModalProps {
  loanIds: string[];
  onClose: () => void;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `$${parseFloat((amount / 1_000_000).toFixed(2))}M`;
  if (amount >= 1_000) return `$${parseFloat((amount / 1_000).toFixed(0))}k`;
  return `$${amount}`;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPercent(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

interface Row {
  label: string;
  getValue: (detail: LoanDetail, sc: UnderwritingScorecard | null) => string;
}

const COMPARE_ROWS: Row[] = [
  { label: 'Display Label',      getValue: (d) => d.loan.displayLabel },
  { label: 'Stage',              getValue: (d) => d.loan.stageId },
  { label: 'Amount',             getValue: (d) => formatAmount(d.loan.loanAmount) },
  { label: 'Current Balance',    getValue: (d) => formatAmount(d.loan.currentBalance) },
  { label: 'LTV %',              getValue: (d) => formatPercent(d.loan.computedLtv) },
  { label: 'Interest Rate',      getValue: (d) => d.loan.interestRate != null ? `${(d.loan.interestRate * 100).toFixed(2)}%` : '—' },
  { label: 'Servicer',           getValue: (d) => d.loan.servicer || '—' },
  { label: 'Closing Date',       getValue: (d) => formatDate(d.loan.closingDate) },
  { label: 'Funded Date',        getValue: (d) => formatDate(d.loan.fundedDate) },
  { label: 'Loan Position',      getValue: (d) => d.loan.loanPosition || '—' },
  { label: 'Auto Pay',           getValue: (d) => d.loan.autoPayEnabled ? 'Yes' : 'No' },
  { label: 'Risk Level',         getValue: (d) => {
    const ltv = d.loan.computedLtv;
    if (d.loan.stageId === 'stage-7') return 'Critical';
    if (d.loan.stageId === 'stage-6') return 'High';
    if (ltv != null && ltv > 0.75) return 'High';
    if (ltv != null && ltv > 0.65) return 'Medium';
    return 'Low';
  }},
  { label: 'Scorecard Decision', getValue: (_, sc) => sc?.decision ?? '—' },
];

export function LoanCompareModal({ loanIds, onClose }: LoanCompareModalProps) {
  const service = useLoanService();
  const [details, setDetails] = useState<(LoanDetail | null)[]>([]);
  const [scorecards, setScorecards] = useState<(UnderwritingScorecard | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      Promise.all(loanIds.map(id => service.getLoan(id).catch(() => null))),
      Promise.all(loanIds.map(id => service.getScorecard(id).catch(() => null))),
    ]).then(([d, sc]) => {
      setDetails(d);
      setScorecards(sc);
      setLoading(false);
    });
  }, [loanIds, service]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  // Check if all values in a row are the same
  function rowHasDiff(rowIdx: number): boolean {
    const vals = details
      .map((d, i) => d ? COMPARE_ROWS[rowIdx].getValue(d, scorecards[i] ?? null) : null)
      .filter((v): v is string => v !== null);
    if (vals.length < 2) return false;
    return vals.some(v => v !== vals[0]);
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-[#22272b] border border-[#3d4b5c] rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3d4b5c] flex-shrink-0">
          <div>
            <h2 className="text-[#e8ecf0] font-semibold text-sm">Loan Comparison</h2>
            <p className="text-[#5d6f7e] text-xs mt-0.5">{loanIds.length} loans selected</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#5a6878] hover:text-[#b6c2cf] hover:bg-[#2d3748] transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[#5d6f7e] text-sm animate-pulse">Loading loan data…</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#3d4b5c]">
                  <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-[#5d6f7e] uppercase tracking-wider w-36 sticky left-0 bg-[#22272b]">
                    Field
                  </th>
                  {details.map((d, i) => (
                    <th key={loanIds[i]} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#b6c2cf]">
                      {d?.loan.displayLabel ?? loanIds[i]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => {
                  const hasDiff = rowHasDiff(ri);
                  return (
                    <tr
                      key={row.label}
                      className={[
                        'border-b border-[#2d3748] transition-colors',
                        hasDiff ? 'bg-[#2d3748]' : 'hover:bg-[#282e33]',
                      ].join(' ')}
                    >
                      <td className="px-5 py-2 text-[11px] font-medium text-[#5d6f7e] whitespace-nowrap sticky left-0 bg-inherit">
                        {row.label}
                        {hasDiff && (
                          <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-yellow-400 align-middle" title="Values differ" />
                        )}
                      </td>
                      {details.map((d, i) => {
                        const val = d ? row.getValue(d, scorecards[i] ?? null) : '—';
                        return (
                          <td key={loanIds[i]} className="px-4 py-2 text-[12px] text-[#b6c2cf] font-mono">
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
