import { useState } from 'react';
import { STAGES } from '../../data/stages';

interface BulkActionBarProps {
  count: number;
  onMoveToStage: (stageId: string) => void;
  onClear: () => void;
}

export function BulkActionBar({ count, onMoveToStage, onClear }: BulkActionBarProps) {
  const [selectOpen, setSelectOpen] = useState(false);

  const isVisible = count > 0;

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-[90]',
        'bg-[#22272b] border-t border-[#3d4b5c] px-6 py-3',
        'flex items-center gap-4',
        'transition-transform duration-200 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
      aria-hidden={!isVisible}
    >
      {/* Selection count */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Teal checkbox icon */}
        <span className="w-5 h-5 rounded border-2 border-[#4bce97] flex items-center justify-center bg-[#4bce97]/15">
          <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3">
            <path d="M2 5l2.25 2.25L8 3" stroke="#4bce97" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="text-sm font-medium text-[#e8ecf0]">
          {count} loan{count !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="w-px h-5 bg-[#3d4b5c] flex-shrink-0" />

      {/* Move to stage dropdown */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setSelectOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[#b6c2cf] bg-[#2d3748] border border-[#454f59] hover:border-[#6b7a8d] hover:text-[#e8ecf0] transition-colors"
        >
          Move to stage
          <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {selectOpen && (
          <>
            {/* Click-away backdrop */}
            <div
              className="fixed inset-0 z-[91]"
              onClick={() => setSelectOpen(false)}
            />
            <div className="absolute bottom-full mb-2 left-0 z-[92] w-52 bg-[#1d2125] border border-[#3d4b5c] rounded-lg shadow-2xl py-1 overflow-hidden">
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    onMoveToStage(stage.id);
                    setSelectOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#b6c2cf] hover:bg-[#2d3748] hover:text-[#e8ecf0] transition-colors text-left"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Clear button */}
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[#8c9bab] hover:text-[#b6c2cf] hover:bg-[#2d3748] transition-colors"
      >
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
        </svg>
        Clear
      </button>
    </div>
  );
}
