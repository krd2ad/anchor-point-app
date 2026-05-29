import { useEffect, useState, useCallback } from 'react';
import type { StageStep, LoanStepStatus, StepStatus } from '../../types';
import { STAGES } from '../../data/stages';
import { useLoanService } from '../../context/LoanServiceProvider';

interface StageStepChecklistProps {
  loanId: string;
  stageId: string;
  isCurrentStage: boolean;
}

function nextStatus(current: StepStatus): StepStatus {
  if (current === 'not_done') return 'done';
  if (current === 'done')     return 'na';
  return 'not_done';
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="w-5 h-5 flex-shrink-0"
      >
        <circle cx="10" cy="10" r="9" fill="#4bce97" />
        <path
          d="M6 10l3 3 5-5"
          stroke="#1d2125"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'na') {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0">
        <circle cx="10" cy="10" r="9" fill="#3d4b5c" />
        <line
          x1="7" y1="10" x2="13" y2="10"
          stroke="#7a8899"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // not_done
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke="#3d4b5c" strokeWidth="2" />
    </svg>
  );
}

export function StageStepChecklist({ loanId, stageId, isCurrentStage }: StageStepChecklistProps) {
  const service = useLoanService();
  const [steps, setSteps] = useState<StageStep[]>([]);
  const [statuses, setStatuses] = useState<LoanStepStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const stage = STAGES.find((s) => s.id === stageId);

  const load = useCallback(async () => {
    setLoading(true);
    const [fetchedSteps, fetchedStatuses] = await Promise.all([
      service.getStageSteps(stageId),
      service.getStepStatuses(loanId),
    ]);
    setSteps(fetchedSteps);
    setStatuses(fetchedStatuses);
    setLoading(false);
  }, [service, stageId, loanId]);

  useEffect(() => {
    load();
  }, [load]);

  function getStatus(stepId: string): StepStatus {
    return statuses.find((s) => s.stepId === stepId)?.status ?? 'not_done';
  }

  async function handleToggle(stepId: string) {
    const current = getStatus(stepId);
    const next = nextStatus(current);

    // Optimistic update
    setStatuses((prev) => {
      const existing = prev.find((s) => s.stepId === stepId);
      if (existing) {
        return prev.map((s) =>
          s.stepId === stepId ? { ...s, status: next } : s
        );
      }
      return [
        ...prev,
        {
          id: `optimistic-${stepId}`,
          loanId,
          stepId,
          status: next,
          completedBy: null,
          completedAt: null,
        },
      ];
    });

    try {
      const updated = await service.setStepStatus(loanId, stepId, next);
      setStatuses((prev) =>
        prev.map((s) => (s.stepId === stepId ? updated : s))
      );
    } catch {
      // Rollback on error
      setStatuses((prev) =>
        prev.map((s) =>
          s.stepId === stepId ? { ...s, status: current } : s
        )
      );
    }
  }

  const doneCount = steps.filter(
    (s) => getStatus(s.id) === 'done' || getStatus(s.id) === 'na'
  ).length;

  if (loading) {
    return (
      <div className="p-4 flex items-center gap-2 text-[#7a8899] text-sm">
        <span className="animate-spin h-4 w-4 border-2 border-[#3d4b5c] border-t-[#579dff] rounded-full" />
        Loading…
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {stage && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
        )}
        <span className="text-sm font-semibold text-[#e8ecf0]">
          {stage?.name ?? stageId}
        </span>
        {isCurrentStage && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3d4b5c] text-[#7a8899]">
            Current
          </span>
        )}
        <span className="ml-auto text-xs text-[#7a8899]">
          {doneCount} / {steps.length} complete
        </span>
      </div>

      {/* Steps */}
      <ul className="space-y-1.5">
        {steps.map((step) => {
          const status = getStatus(step.id);
          return (
            <li key={step.id} className="flex items-start gap-2">
              <button
                onClick={() => handleToggle(step.id)}
                className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
                title={`Toggle step: ${status}`}
              >
                <StatusIcon status={status} />
              </button>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-[10px] text-[#7a8899] mt-0.5 flex-shrink-0 w-4 text-right">
                  {step.order}.
                </span>
                <span
                  className={`text-sm leading-snug ${
                    status === 'done'
                      ? 'text-[#7a8899] line-through'
                      : status === 'na'
                      ? 'text-[#7a8899] italic'
                      : 'text-[#b6c2cf]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
