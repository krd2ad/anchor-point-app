const AVATARS = [
  { initials: 'R', color: '#579dff' },
  { initials: 'A', color: '#9f8fef' },
  { initials: 'M', color: '#4bce97' },
  { initials: 'J', color: '#f5cd47' },
  { initials: 'T', color: '#f87168' },
];

interface BoardHeaderProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export function BoardHeader({ zoom, onZoomIn, onZoomOut, onZoomReset }: BoardHeaderProps) {
  const pct = Math.round(zoom * 100);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#1d2125] border-b border-[#2d3748] flex-shrink-0">
      <span className="font-bold text-[#e8ecf0] text-base tracking-wide">
        Anchor Point Lending
      </span>

      <div className="flex items-center gap-3">
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
