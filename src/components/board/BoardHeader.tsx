const AVATARS = [
  { initials: 'R', color: '#579dff' },
  { initials: 'A', color: '#9f8fef' },
  { initials: 'M', color: '#4bce97' },
  { initials: 'J', color: '#f5cd47' },
  { initials: 'T', color: '#f87168' },
];

export type AppView = 'board' | 'files';

interface BoardHeaderProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onNewLoan?: () => void;
}

export function BoardHeader({ zoom, onZoomIn, onZoomOut, onZoomReset, currentView, onViewChange, onNewLoan }: BoardHeaderProps) {
  const pct = Math.round(zoom * 100);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#1d2125] border-b border-[#2d3748] flex-shrink-0">
      <div className="flex items-center gap-6">
        <span className="font-bold text-[#e8ecf0] text-base tracking-wide">
          Anchor Point Lending
        </span>

        {/* View tabs */}
        <nav className="flex items-center gap-1">
          {(['board', 'files'] as AppView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors relative ${
                currentView === v
                  ? 'text-[#e8ecf0]'
                  : 'text-[#7a8899] hover:text-[#b6c2cf] hover:bg-[#282e33]'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
              {currentView === v && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#579dff] rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* New Loan button — only visible in board view */}
        {onNewLoan && currentView === 'board' && (
          <button
            onClick={onNewLoan}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#579dff] hover:bg-[#4a8fe8] rounded-md transition-colors"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            New Loan
          </button>
        )}

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-[#22272b] border border-[#3d4b5c] rounded-md px-1 py-0.5">
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom out (Cmd –)"
            className="w-6 h-6 flex items-center justify-center rounded text-[#b6c2cf] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            −
          </button>
          <button
            onClick={onZoomReset}
            title="Reset zoom"
            className="min-w-[38px] text-center text-[11px] font-mono text-[#7a8899] hover:text-[#b6c2cf] transition-colors px-0.5"
          >
            {pct}%
          </button>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 1.0}
            title="Zoom in (Cmd +)"
            className="w-6 h-6 flex items-center justify-center rounded text-[#b6c2cf] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            +
          </button>
        </div>

        {/* Avatars */}
        <div className="flex items-center gap-1">
          {AVATARS.map((avatar) => (
            <div
              key={avatar.initials}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white select-none"
              style={{ backgroundColor: avatar.color }}
              title={avatar.initials}
            >
              {avatar.initials}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

