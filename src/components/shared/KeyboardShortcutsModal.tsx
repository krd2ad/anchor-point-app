import { useEffect } from 'react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center font-mono bg-[#1d2125] border border-[#3d4b5c] rounded px-2 py-0.5 text-xs text-[#b6c2cf] leading-snug whitespace-nowrap">
      {children}
    </kbd>
  );
}

function ShortcutRow({ keys, description }: { keys: React.ReactNode[]; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[13px] text-[#8c9bab]">{description}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {keys.map((k, i) => (
          <span key={i}>{k}</span>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#5d6f7e] font-semibold mb-2">{title}</p>
      <div className="divide-y divide-[#2d3748]">{children}</div>
    </div>
  );
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-[#22272b] border border-[#3d4b5c] rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#3d4b5c]">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#579dff]">
              <rect x="2" y="5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5 9h1M8 9h1M11 9h1M14 9h1M5 12h3M10 12h1M13 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <h2 className="text-sm font-semibold text-[#e8ecf0]">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          <Section title="Navigation">
            <ShortcutRow keys={[<Key>⌘</Key>, <Key>K</Key>]} description="Open search" />
            <ShortcutRow keys={[<Key>←</Key>, <Key>→</Key>]} description="Move between columns" />
            <ShortcutRow keys={[<Key>↑</Key>, <Key>↓</Key>]} description="Move between cards" />
            <ShortcutRow keys={[<Key>Enter</Key>]} description="Open loan detail" />
            <ShortcutRow keys={[<Key>Esc</Key>]} description="Close / deselect" />
          </Section>

          <Section title="Zoom">
            <ShortcutRow keys={[<Key>⌘</Key>, <Key>+</Key>]} description="Zoom in" />
            <ShortcutRow keys={[<Key>⌘</Key>, <Key>−</Key>]} description="Zoom out" />
            <ShortcutRow keys={[<Key>⌘</Key>, <Key>0</Key>]} description="Reset zoom" />
          </Section>

          <Section title="Board">
            <ShortcutRow keys={[<Key>⌘</Key>, <Key>P</Key>]} description="Print portfolio" />
            <ShortcutRow keys={[<Key>Shift</Key>, <Key>Click</Key>]} description="Bulk select loans" />
            <ShortcutRow keys={[<Key>?</Key>]} description="Show this shortcuts panel" />
          </Section>

          <Section title="Detail Panel">
            <ShortcutRow keys={[<Key>‹</Key>]} description="Previous loan" />
            <ShortcutRow keys={[<Key>›</Key>]} description="Next loan" />
            <ShortcutRow keys={[<Key>★</Key>]} description="Star / unstar loan" />
          </Section>
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-[#3d4b5c]">
          <p className="text-[11px] text-[#5d6f7e] text-center">
            Press <Key>Esc</Key> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
