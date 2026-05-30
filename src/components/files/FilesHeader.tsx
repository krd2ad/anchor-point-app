interface FilesHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showEmptyCategories: boolean;
  onToggleEmpty: (v: boolean) => void;
  stats: { total: number; verified: number; received: number; requested: number };
}

export function FilesHeader({
  searchQuery,
  onSearchChange,
  showEmptyCategories,
  onToggleEmpty,
  stats,
}: FilesHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-[#282e33] border-b border-[#3d4b5c] flex-shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7a8899] pointer-events-none"
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files, categories, status…"
          className="w-full bg-[#22272b] border border-[#3d4b5c] rounded-md pl-8 pr-3 py-1.5 text-sm text-[#b6c2cf] placeholder-[#4d5f6e] focus:outline-none focus:border-[#579dff] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7a8899] hover:text-[#b6c2cf] transition-colors"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Show-empty toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <button
          role="switch"
          aria-checked={showEmptyCategories}
          onClick={() => onToggleEmpty(!showEmptyCategories)}
          className={`relative w-8 h-4.5 rounded-full transition-colors ${
            showEmptyCategories ? 'bg-[#579dff]' : 'bg-[#3d4b5c]'
          }`}
          style={{ width: 32, height: 18 }}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
              showEmptyCategories ? 'translate-x-3.5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-xs text-[#7a8899]">Show empty folders</span>
      </label>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-[#7a8899] ml-auto">
        <span>{stats.total} files</span>
        <span className="text-green-400">{stats.verified} verified</span>
        <span className="text-blue-400">{stats.received} received</span>
        <span className="text-yellow-400">{stats.requested} requested</span>
      </div>
    </div>
  );
}
