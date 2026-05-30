import { useState } from 'react';
import type { LendingEntity } from '../../types';
import { useLoanService, useLoans } from '../../context/LoanServiceProvider';
import { useToast } from '../shared/Toast';

interface NewLoanModalProps {
  onClose: () => void;
}

export function NewLoanModal({ onClose }: NewLoanModalProps) {
  const service = useLoanService();
  const { refreshLoans } = useLoans();
  const { showToast } = useToast();

  const [displayLabel, setDisplayLabel] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [lendingEntity, setLendingEntity] = useState<LendingEntity>('APL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(loanAmount.replace(/[^0-9.]/g, '')) || 0;
  const canSubmit = displayLabel.trim().length > 0 && amountNum > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await service.createLoan({
        displayLabel: displayLabel.trim(),
        loanAmount: amountNum,
        lendingEntity,
      });
      await refreshLoans();
      showToast('Loan added to New Intake', 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-[#22272b] border border-[#3d4b5c] rounded-xl shadow-2xl w-[400px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3d4b5c]">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#579dff]">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
              <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h2 className="text-sm font-semibold text-[#e8ecf0]">New Loan</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Display label */}
          <div>
            <label className="block text-xs font-medium text-[#7a8899] mb-1.5" htmlFor="nl-label">
              Display Label
            </label>
            <input
              id="nl-label"
              type="text"
              value={displayLabel}
              onChange={e => setDisplayLabel(e.target.value)}
              placeholder="e.g. Jane Smith — 123 Oak St"
              autoFocus
              className="w-full bg-[#1d2125] border border-[#3d4b5c] rounded-md px-3 py-2 text-sm text-[#e8ecf0] placeholder-[#454f59] focus:outline-none focus:border-[#579dff] transition-colors"
            />
          </div>

          {/* Loan amount */}
          <div>
            <label className="block text-xs font-medium text-[#7a8899] mb-1.5" htmlFor="nl-amount">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#5c6b7a] font-mono select-none">$</span>
              <input
                id="nl-amount"
                type="text"
                inputMode="numeric"
                value={loanAmount}
                onChange={e => setLoanAmount(e.target.value)}
                placeholder="250000"
                className="w-full bg-[#1d2125] border border-[#3d4b5c] rounded-md pl-7 pr-3 py-2 text-sm text-[#e8ecf0] font-mono placeholder-[#454f59] focus:outline-none focus:border-[#579dff] transition-colors"
              />
            </div>
          </div>

          {/* Lending entity */}
          <div>
            <label className="block text-xs font-medium text-[#7a8899] mb-1.5" htmlFor="nl-entity">
              Lending Entity
            </label>
            <select
              id="nl-entity"
              value={lendingEntity}
              onChange={e => setLendingEntity(e.target.value as LendingEntity)}
              className="w-full bg-[#1d2125] border border-[#3d4b5c] rounded-md px-3 py-2 text-sm text-[#e8ecf0] focus:outline-none focus:border-[#579dff] transition-colors appearance-none"
            >
              <option value="APL">APL — Anchor Point Lending</option>
              <option value="APG">APG — Anchor Point Group</option>
            </select>
          </div>

          {/* Stage note */}
          <p className="text-[11px] text-[#5c6b7a] flex items-center gap-1.5">
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6 5v4M6 3.5h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Loan will be placed in <span className="text-[#8c9bab] font-medium ml-0.5">New Intake</span>
          </p>

          {error && (
            <p className="text-xs text-[#f87168]">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-[#b6c2cf] bg-[#2d3748] hover:bg-[#3d4b5c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#579dff] hover:bg-[#4a8fe8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Create Loan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
