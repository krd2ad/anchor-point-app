import type { Loan, StageChangeEvent } from '../../types';
import { STAGES } from '../../data/stages';

interface StageJourneyProps {
  loan: Loan;
  stageHistory: StageChangeEvent[];
}

export function StageJourney({ loan, stageHistory }: StageJourneyProps) {
  const currentStage = STAGES.find(s => s.id === loan.stageId);
  const currentOrder = currentStage?.order ?? 0;

  // Stages that have been explicitly visited (appear as fromStageId in history)
  const visitedStageIds = new Set(stageHistory.map(e => e.fromStageId));

  // Days in current stage, derived from updatedAt
  const daysInStage = Math.floor(
    (Date.now() - new Date(loan.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5d6f7e] mb-2">
        Stage Journey
      </p>

      {/* 8-segment progress bar */}
      <div className="flex gap-0.5 mb-2">
        {STAGES.map((stage) => {
          const isPast = stage.order < currentOrder || visitedStageIds.has(stage.id);
          const isCurrent = stage.id === loan.stageId;
          let bgColor: string;
          if (isCurrent) {
            bgColor = stage.color;
          } else if (isPast) {
            bgColor = stage.color + '60';
          } else {
            // isFuture
            bgColor = '#2d3748';
          }

          return (
            <div
              key={stage.id}
              className="flex-1 flex flex-col items-center"
              title={stage.name}
            >
              <div
                className={`h-2 w-full rounded-sm transition-colors${isCurrent ? ' ring-1 ring-offset-1 ring-offset-[#282e33]' : ''}`}
                style={{
                  backgroundColor: bgColor,
                  ...(isCurrent ? { ringColor: stage.color } : {}),
                }}
              />
              {isCurrent && (
                <div
                  className="w-0 h-0 mt-0.5"
                  style={{
                    borderLeft: '3px solid transparent',
                    borderRight: '3px solid transparent',
                    borderBottom: `4px solid ${stage.color}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current stage label + days */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {currentStage && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentStage.color }}
            />
          )}
          <span className="text-[11px] font-semibold text-[#b6c2cf]">
            {currentStage?.name ?? 'Unknown'}
          </span>
        </div>
        <span
          className={`text-[10px] font-mono ${
            daysInStage >= 31 ? 'text-orange-400' :
            daysInStage >= 8  ? 'text-yellow-400' :
            'text-[#5d6f7e]'
          }`}
        >
          {daysInStage}d in stage
        </span>
      </div>
    </div>
  );
}
