import { useEffect } from 'react';
import type { LoanDetail, StageChangeEvent } from '../../types';
import { STAGES } from '../../data/stages';
import { STAGE_STEPS } from '../../data/stageSteps';
import { fmt, fmtDate } from '../../lib/formatters';

interface LoanSummarySheetProps {
  loanDetail: LoanDetail;
  stageHistory: StageChangeEvent[];
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-1.5 pr-4 text-xs font-medium text-gray-500 whitespace-nowrap w-36">{label}</td>
      <td className="py-1.5 text-xs text-gray-900">{value}</td>
    </tr>
  );
}

export function LoanSummarySheet({ loanDetail, stageHistory, onClose }: LoanSummarySheetProps) {
  const { loan, borrowerEntity, principal, parcels, stepStatuses, comments } = loanDetail;

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Stage name lookup
  function stageName(id: string) {
    return STAGES.find(s => s.id === id)?.name ?? id;
  }

  // Checklist progress per stage
  const stageProgress = STAGES.map(stage => {
    const stepsForStage = STAGE_STEPS.filter(s => s.stageId === stage.id && !s.subWorkflow);
    const doneCount = stepsForStage.filter(s =>
      stepStatuses.find(ss => ss.stepId === s.id && ss.status === 'done')
    ).length;
    return { stage, total: stepsForStage.length, done: doneCount };
  }).filter(p => p.total > 0);

  // Last 5 comments
  const recentComments = [...comments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const currentStage = STAGES.find(s => s.id === loan.stageId);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Sheet */}
        <div
          className="print-view relative bg-white text-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Controls bar (hidden when printing) */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between print:hidden">
            <span className="text-xs text-gray-400 font-medium">Loan Summary Sheet</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                  <rect x="2" y="5" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M4 9h6M4 11h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <circle cx="10.5" cy="7.5" r="0.75" fill="currentColor"/>
                </svg>
                Print
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Sheet body */}
          <div className="p-8 space-y-8">
            {/* 1. Header */}
            <div className="border-b-2 border-gray-900 pb-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                Anchor Point Lending — Loan Summary
              </p>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{loan.displayLabel}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">
                  {loan.lendingEntity} · {currentStage?.name ?? loan.stageId}
                </span>
                <span className="text-xs text-gray-400">
                  Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* 2. Loan Details */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Loan Details</h2>
              <div className="grid grid-cols-2 gap-x-8">
                <table className="w-full">
                  <tbody>
                    <Row label="Loan Amount"     value={fmt(loan.loanAmount)} />
                    <Row label="Current Balance" value={fmt(loan.currentBalance)} />
                    <Row label="Interest Rate"   value={`${loan.interestRate.toFixed(2)}%`} />
                    <Row label="Auto Pay"        value={loan.autoPayEnabled ? 'Enabled' : 'Disabled'} />
                    <Row label="Servicer"        value={loan.servicer} />
                    <Row label="Loan Position"   value={loan.loanPosition ?? '—'} />
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody>
                    <Row label="Origination"    value={fmtDate(loan.originationDate)} />
                    <Row label="Closing Date"   value={fmtDate(loan.closingDate)} />
                    <Row label="Funded Date"    value={fmtDate(loan.fundedDate)} />
                    <Row label="First Payment"  value={fmtDate(loan.firstPaymentDate)} />
                    <Row label="Payment Due"    value={`${loan.paymentDueDay}${loan.paymentDueDay === 1 ? 'st' : 'th'} of month`} />
                    <Row label="LTV"            value={loan.computedLtv != null ? `${loan.computedLtv.toFixed(1)}%` : '—'} />
                  </tbody>
                </table>
              </div>

              {/* Borrower + Principal */}
              <div className="mt-4 grid grid-cols-2 gap-x-8">
                <table className="w-full">
                  <tbody>
                    <Row label="Borrower Entity" value={`${borrowerEntity.name} (${borrowerEntity.type})`} />
                    <Row label="EIN"             value={borrowerEntity.ein ?? '—'} />
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody>
                    <Row label="Principal"  value={`${principal.firstName} ${principal.lastName}`} />
                    <Row label="Email"      value={principal.email} />
                    <Row label="Phone"      value={principal.phone} />
                  </tbody>
                </table>
              </div>

              {/* Parcels */}
              {parcels.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                    Collateral ({parcels.length} parcel{parcels.length !== 1 ? 's' : ''})
                  </p>
                  <ul className="space-y-1">
                    {parcels.map(p => (
                      <li key={p.id} className="text-xs text-gray-700">
                        {p.addressLine}, {p.city}, {p.state}
                        {p.propertyType && ` · ${p.propertyType}`}
                        {p.acreage != null && ` · ${p.acreage}ac`}
                        {p.valuation != null && ` · ${fmt(p.valuation)}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 3. Stage Journey */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Stage Journey</h2>
              {stageHistory.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No stage transitions recorded.</p>
              ) : (
                <ol className="space-y-2">
                  {stageHistory.map(evt => (
                    <li key={evt.id} className="flex items-center gap-3 text-xs text-gray-700">
                      <span className="w-32 text-gray-400 tabular-nums">
                        {new Date(evt.movedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-gray-500">{stageName(evt.fromStageId)}</span>
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-gray-400 flex-shrink-0">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium text-gray-800">{stageName(evt.toStageId)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* 4. Checklist Progress */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Checklist Progress</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {stageProgress.map(({ stage, done, total }) => {
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  const isCurrentStage = stage.id === loan.stageId;
                  return (
                    <div key={stage.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[10px] truncate ${isCurrentStage ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                            {stage.name}
                          </span>
                          <span className="text-[10px] text-gray-400 tabular-nums ml-1">{done}/{total}</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: stage.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Comments */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Recent Comments {recentComments.length > 0 && `(${recentComments.length})`}
              </h2>
              {recentComments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentComments.map(c => (
                    <li key={c.id} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-gray-400 tabular-nums">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400">·</span>
                        <span className="text-[10px] text-gray-500">{stageName(c.stageId)}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
