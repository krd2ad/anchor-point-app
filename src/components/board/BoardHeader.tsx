import { useState, useEffect, useRef } from 'react';

const AVATARS = [
  { initials: 'R', color: '#579dff' },
  { initials: 'A', color: '#9f8fef' },
  { initials: 'M', color: '#4bce97' },
  { initials: 'J', color: '#f5cd47' },
  { initials: 'T', color: '#f87168' },
];

export type AppView = 'board' | 'files';

export interface DueActionItem {
  label: string;
  reason: string;
}

interface BoardHeaderProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onNewLoan?: () => void;
  onExportCsv?: () => void;
  onPrint?: () => void;
  dueActionsCount?: number;
  dueActionItems?: DueActionItem[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export function BoardHeader({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  currentView,
  onViewChange,
  onNewLoan,
  onExportCsv,
  onPrint,
  dueActionsCount = 0,
  dueActionItems = [],
  theme = 'dark',
  onToggleTheme,
}: BoardHeaderProps) {
  const pct = Math.round(zoom * 100);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bellOpen) return;
    function handleClickAway(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, [bellOpen]);

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

        {/* Due-actions bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen((o) => !o)}
            title="Due actions"
            className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#7a8899] hover:text-[#b6c2cf] hover:bg-[#282e33] transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5 w-[18px] h-[18px]">
              <path
                d="M10 2a6 6 0 00-6 6v2.5L2.5 13h15L16 10.5V8a6 6 0 00-6-6z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M8 15a2 2 0 004 0"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            {dueActionsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#f87168] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {dueActionsCount > 9 ? '9+' : dueActionsCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-[#22272b] border border-[#3d4b5c] rounded-lg shadow-xl z-50">
              <div className="px-3 py-2 border-b border-[#3d4b5c]">
                <p className="text-[#e8ecf0] text-xs font-semibold">Due Actions</p>
              </div>
              {dueActionItems.length === 0 ? (
                <p className="px-3 py-3 text-[#7a8899] text-xs">No actions due today.</p>
              ) : (
                <ul className="max-h-60 overflow-y-auto divide-y divide-[#2d3748]">
                  {dueActionItems.map((item, i) => (
                    <li key={i} className="px-3 py-2">
                      <p className="text-[#e8ecf0] text-xs font-medium truncate">{item.label}</p>
                      <p className="text-[#7a8899] text-[11px] mt-0.5">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Dark/light mode toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#7a8899] hover:text-[#b6c2cf] hover:bg-[#282e33] transition-colors"
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}

        {/* Export CSV — board view only */}
        {onExportCsv && currentView === 'board' && (
          <button
            onClick={onExportCsv}
            title="Export portfolio as CSV"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#7a8899] hover:text-[#b6c2cf] border border-[#3d4b5c] hover:border-[#5d6f7e] rounded-md transition-colors"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            CSV
          </button>
        )}

        {/* Print — board view only */}
        {onPrint && currentView === 'board' && (
          <button
            onClick={onPrint}
            title="Print loan portfolio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#7a8899] hover:text-[#b6c2cf] border border-[#3d4b5c] hover:border-[#5d6f7e] rounded-md transition-colors"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <rect x="2" y="5" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 5V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M4 9h6M4 11h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              <circle cx="10.5" cy="7.5" r="0.75" fill="currentColor"/>
            </svg>
            Print
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

