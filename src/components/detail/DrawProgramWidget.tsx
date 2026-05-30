import { useEffect, useState } from 'react';
import type { Loan, LoanStepStatus, ProcessStep } from '../../types';
import { useLoanService } from '../../context/LoanServiceProvider';
import { useToast } from '../shared/Toast';

interface DrawProgramWidgetProps {
  loanId: string;
  loan: Loan;
}

function StatusDot({ status }: { status: 'done' | 'not_done' | 'na' }) {
  if (status === 'done') {
    return (
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 bg-[#4bce97]"
        title="Done"
      />
    );
  }
  if (status === 'na') {
    return (
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 bg-[#3d4b5c]"
        title="N/A"
      />
    );
  }
  return (
    <span
      className="w-2 h-2 rounded-full flex-shrink-0 bg-[#454f59]"
      title="Not done"
    />
  );
}

export function DrawProgramWidget({ loanId, loan }: DrawProgramWidgetProps) {
  if (!loan.hasDrawProgram) return null;

  const service = useLoanService();
  const { showToast } = useToast();
  const [drawSteps, setDrawSteps] = useState<ProcessStep[]>([]);
  const [stepStatuses, setStepStatuses] = useState<LoanStepStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      service.getStageSteps('stage-6'),
      service.getStepStatuses(loanId),
    ]).then(([allSteps, statuses]) => {
      const draw = allSteps.filter(s => s.subWorkflow === 'draw');
      setDrawSteps(draw);
      setStepStatuses(statuses);
      setLoading(false);
    });
  }, [loanId, service]);

  const statusMap = new Map<string, 'done' | 'not_done' | 'na'>(
    stepStatuses.map(s => [s.stepId, s.status]),
  );

  const total = drawSteps.length;
  const doneCount = drawSteps.filter(s => statusMap.get(s.id) === 'done').length;

  const badgeColor =
    doneCount === total && total > 0
      ? 'bg-[#4bce97]/15 text-[#4bce97] border-[#4bce97]/30'
      : doneCount > 0
        ? 'bg-[#f5cd47]/10 text-[#f5cd47] border-[#f5cd47]/30'
        : 'bg-[#3d4b5c]/50 text-[#7a8899] border-[#3d4b5c]';

  return (
    <div className="mx-4 my-3 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {/* Draw icon */}
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-[#7a8899] flex-shrink-0">
            <path d="M2 4h10M2 7h7M2 10h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold text-[#b6c2cf]">Draw Program</span>
        </div>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badgeColor}`}
        >
          {doneCount}/{total} complete
        </span>
      </div>

      {/* Step checklist */}
      {loading ? (
        <p className="text-[11px] text-[#5d6f7e] italic py-1">Loading…</p>
      ) : drawSteps.length === 0 ? (
        <p className="text-[11px] text-[#5d6f7e] italic">No draw steps found.</p>
      ) : (
        <div className="flex flex-col gap-1 mb-2.5">
          {drawSteps.map(step => {
            const status = statusMap.get(step.id) ?? 'not_done';
            return (
              <div key={step.id} className="flex items-center gap-2">
                <StatusDot status={status} />
                <span
                  className={`text-[11px] truncate leading-snug ${
                    status === 'done'
                      ? 'text-[#7a8899] line-through'
                      : status === 'na'
                        ? 'text-[#5d6f7e] italic'
                        : 'text-[#b6c2cf]'
                  }`}
                  title={step.label}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Track draw button */}
      <button
        onClick={() =>
          showToast(
            'Navigate to Special Servicing tab to manage draw steps',
            'info',
          )
        }
        className="mt-1 text-[10px] font-medium text-[#579dff] hover:text-[#85b8ff] transition-colors px-2 py-1 rounded bg-[#579dff]/10 hover:bg-[#579dff]/15 border border-[#579dff]/20"
      >
        Track draw →
      </button>
    </div>
  );
}
