export interface BoardFilters {
  entity: 'all' | 'APL' | 'APG';
  risk: 'all' | 'medium' | 'high' | 'critical';
  hasUnmetGates: boolean;
}

export const DEFAULT_FILTERS: BoardFilters = {
  entity: 'all',
  risk: 'all',
  hasUnmetGates: false,
};

export function filtersAreActive(f: BoardFilters): boolean {
  return f.entity !== 'all' || f.risk !== 'all' || f.hasUnmetGates;
}

interface FilterBarProps {
  filters: BoardFilters;
  onChange: (f: BoardFilters) => void;
  onClear: () => void;
}

interface PillProps {
  active: boolean;
  activeClass: string;
  onClick: () => void;
  children: React.ReactNode;
}

function Pill({ active, activeClass, onClick, children }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-100 leading-none',
        active
          ? activeClass
          : 'bg-transparent border-[#454f59] text-[#5d6f7e] hover:border-[#6b7a8d] hover:text-[#8c9bab]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function FilterBar({ filters, onChange, onClear }: FilterBarProps) {
  const active = filtersAreActive(filters);

  function toggleEntity(val: 'APL' | 'APG') {
    onChange({ ...filters, entity: filters.entity === val ? 'all' : val });
  }

  function toggleRisk(val: 'medium' | 'high' | 'critical') {
    onChange({ ...filters, risk: filters.risk === val ? 'all' : val });
  }

  function toggleGates() {
    onChange({ ...filters, hasUnmetGates: !filters.hasUnmetGates });
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 flex-wrap">
      {/* Entity pills */}
      <Pill
        active={filters.entity === 'APL'}
        activeClass="bg-[#579dff]/20 border-[#579dff]/60 text-[#579dff]"
        onClick={() => toggleEntity('APL')}
      >
        APL only
      </Pill>
      <Pill
        active={filters.entity === 'APG'}
        activeClass="bg-[#579dff]/20 border-[#579dff]/60 text-[#579dff]"
        onClick={() => toggleEntity('APG')}
      >
        APG only
      </Pill>

      {/* Separator */}
      <span className="w-px h-4 bg-[#3d4b5c] flex-shrink-0" />

      {/* Risk pills */}
      <Pill
        active={filters.risk === 'medium'}
        activeClass="bg-yellow-400/15 border-yellow-400/50 text-yellow-400"
        onClick={() => toggleRisk('medium')}
      >
        Medium+ Risk
      </Pill>
      <Pill
        active={filters.risk === 'high'}
        activeClass="bg-orange-400/15 border-orange-400/50 text-orange-400"
        onClick={() => toggleRisk('high')}
      >
        High+ Risk
      </Pill>
      <Pill
        active={filters.risk === 'critical'}
        activeClass="bg-red-500/15 border-red-500/50 text-red-400"
        onClick={() => toggleRisk('critical')}
      >
        Critical Risk
      </Pill>

      {/* Separator */}
      <span className="w-px h-4 bg-[#3d4b5c] flex-shrink-0" />

      {/* Unmet gates pill */}
      <Pill
        active={filters.hasUnmetGates}
        activeClass="bg-red-500/15 border-red-500/50 text-red-400"
        onClick={toggleGates}
      >
        Unmet Gates
      </Pill>

      {/* Active indicator + clear */}
      {active && (
        <>
          <span className="w-px h-4 bg-[#3d4b5c] flex-shrink-0" />
          <span className="text-[11px] text-[#f5cd47] font-medium">Filters active</span>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[11px] text-[#8c9bab] hover:text-[#b6c2cf] transition-colors"
          >
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
            </svg>
            Clear filters
          </button>
        </>
      )}
    </div>
  );
}
