const AVATARS = [
  { initials: 'R', color: '#579dff' },
  { initials: 'A', color: '#9f8fef' },
  { initials: 'M', color: '#4bce97' },
  { initials: 'J', color: '#f5cd47' },
  { initials: 'T', color: '#f87168' },
];

export function BoardHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#1d2125] border-b border-[#2d3748] flex-shrink-0">
      <span className="font-bold text-[#e8ecf0] text-base tracking-wide">
        Anchor Point Lending
      </span>

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
    </header>
  );
}
