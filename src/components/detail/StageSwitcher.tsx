import { useState } from 'react';
import { STAGES } from '../../data/stages';
import { StageStepChecklist } from './StageStepChecklist';

interface StageSwitcherProps {
  loanId: string;
  currentStageId: string;
}

export function StageSwitcher({ loanId, currentStageId }: StageSwitcherProps) {
  const [selectedStageId, setSelectedStageId] = useState(currentStageId);

  return (
    <div>
      {/* Tab bar */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max border-b border-[#3d4b5c] px-4">
          {STAGES.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            const isCurrent  = stage.id === currentStageId;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'text-[#e8ecf0]'
                    : 'text-[#7a8899] hover:text-[#b6c2cf]'
                }`}
              >
                {/* Current-stage dot */}
                {isCurrent && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                )}
                {stage.name}

                {/* Selected underline */}
                {isSelected && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                    style={{ backgroundColor: stage.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist for selected stage */}
      <StageStepChecklist
        loanId={loanId}
        stageId={selectedStageId}
        isCurrentStage={selectedStageId === currentStageId}
      />
    </div>
  );
}
