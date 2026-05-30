import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLoans } from '../../context/LoanServiceProvider';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { STAGES } from '../../data/stages';
import type { Loan } from '../../types';

interface CommandPaletteProps {
  onNavigateToLoan: (loanId: string) => void;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `$${parseFloat((amount / 1_000_000).toFixed(1))}M`;
  if (amount >= 1_000) return `$${parseFloat((amount / 1_000).toFixed(0))}k`;
  return `$${amount}`;
}

function getPrincipalName(loan: Loan): string {
  // displayLabel often contains the principal/entity name — use as fallback
  return loan.displayLabel;
}

const STAGE_ORDER = new Map(STAGES.map((s) => [s.id, s.order]));

export function CommandPalette({ onNavigateToLoan }: CommandPaletteProps) {
  const { isOpen, close } = useCommandPalette();
  const { loans } = useLoans();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Starred loans (always shown at top regardless of query)
  const starredLoans = loans.filter((l) => l.isStarred);

  // Filter + sort loans
  const filtered = (() => {
    const q = query.trim().toLowerCase();
    let list: Loan[];
    if (!q) {
      // Empty state: all loans sorted by stage order
      list = [...loans].sort(
        (a, b) => (STAGE_ORDER.get(a.stageId) ?? 99) - (STAGE_ORDER.get(b.stageId) ?? 99)
      );
    } else {
      list = loans.filter((loan) => {
        const amountStr = formatAmount(loan.loanAmount).toLowerCase();
        return (
          loan.displayLabel.toLowerCase().includes(q) ||
          amountStr.includes(q) ||
          getPrincipalName(loan).toLowerCase().includes(q)
        );
      });
    }
    return list.slice(0, 8);
  })();

  // For keyboard navigation: combine starred + filtered (de-duped if starred also appears in filtered)
  const starredIds = new Set(starredLoans.map((l) => l.id));
  const allResults: Array<{ loan: Loan; section: 'starred' | 'results' }> = [
    ...starredLoans.map((l) => ({ loan: l, section: 'starred' as const })),
    ...filtered.filter((l) => !starredIds.has(l.id)).map((l) => ({ loan: l, section: 'results' as const })),
  ];

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      // Auto-focus after paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('li[data-result]');
    if (items[activeIdx]) {
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx]);

  const select = useCallback(
    (loan: Loan) => {
      onNavigateToLoan(loan.id);
      close();
    },
    [onNavigateToLoan, close]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[activeIdx]) select(allResults[activeIdx].loan);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.60)' }}
      onMouseDown={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="w-[540px] max-h-[420px] bg-[#22272b] rounded-xl border border-[#3d4b5c] shadow-2xl flex flex-col overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3d4b5c]">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#7a8899] flex-shrink-0">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search loans…"
            className="flex-1 bg-transparent text-[#e8ecf0] placeholder-[#5d6f7e] text-sm outline-none"
          />
          <kbd className="text-[10px] font-mono text-[#5d6f7e] bg-[#2d3748] border border-[#3d4b5c] rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          className="overflow-y-auto flex-1"
        >
          {allResults.length === 0 ? (
            <li className="px-4 py-8 text-center text-[#5d6f7e] text-sm">
              No loans found
            </li>
          ) : (
            (() => {
              let globalIdx = -1;
              const items: React.ReactNode[] = [];

              // Starred section
              if (starredLoans.length > 0) {
                items.push(
                  <li key="__starred-header" className="px-4 pt-2 pb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#f5cd47]/70">
                      Starred
                    </span>
                  </li>
                );
                for (const loan of starredLoans) {
                  globalIdx++;
                  const idx = globalIdx;
                  const stage = STAGES.find((s) => s.id === loan.stageId);
                  const isActive = idx === activeIdx;
                  items.push(
                    <li
                      key={`starred-${loan.id}`}
                      data-result
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={() => select(loan)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-[#2d3748]' : 'hover:bg-[#282e33]'
                      }`}
                    >
                      <span className="text-[11px] flex-shrink-0">⭐</span>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage?.color ?? '#7a8899' }}
                      />
                      <span className="flex-1 text-sm font-semibold text-[#e8ecf0] truncate">{loan.displayLabel}</span>
                      <span className="text-xs font-mono text-[#b6c2cf] flex-shrink-0">{formatAmount(loan.loanAmount)}</span>
                      <span className="text-[11px] text-[#7a8899] flex-shrink-0 hidden sm:block">{stage?.name ?? loan.stageId}</span>
                    </li>
                  );
                }
              }

              // Main results section (excluding starred loans already shown)
              const mainResults = filtered.filter((l) => !starredIds.has(l.id));
              if (mainResults.length > 0) {
                if (starredLoans.length > 0) {
                  items.push(
                    <li key="__results-header" className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5d6f7e]">
                        All Loans
                      </span>
                    </li>
                  );
                }
                for (const loan of mainResults) {
                  globalIdx++;
                  const idx = globalIdx;
                  const stage = STAGES.find((s) => s.id === loan.stageId);
                  const isActive = idx === activeIdx;
                  items.push(
                    <li
                      key={`result-${loan.id}`}
                      data-result
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={() => select(loan)}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        isActive ? 'bg-[#2d3748]' : 'hover:bg-[#282e33]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage?.color ?? '#7a8899' }}
                      />
                      <span className="flex-1 text-sm font-semibold text-[#e8ecf0] truncate">{loan.displayLabel}</span>
                      <span className="text-xs font-mono text-[#b6c2cf] flex-shrink-0">{formatAmount(loan.loanAmount)}</span>
                      <span className="text-[11px] text-[#7a8899] flex-shrink-0 hidden sm:block">{stage?.name ?? loan.stageId}</span>
                      {loan.computedLtv != null && (
                        <span className={`text-[11px] font-mono flex-shrink-0 ${
                          loan.computedLtv > 0.7 ? 'text-[#f87168]' :
                          loan.computedLtv > 0.65 ? 'text-[#f5cd47]' : 'text-[#4bce97]'
                        }`}>
                          {(loan.computedLtv * 100).toFixed(0)}% LTV
                        </span>
                      )}
                    </li>
                  );
                }
              }

              // If no starred and no main results
              if (items.length === 0) {
                items.push(
                  <li key="empty" className="px-4 py-8 text-center text-[#5d6f7e] text-sm">
                    No loans found
                  </li>
                );
              }

              return items;
            })()
          )}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#3d4b5c] flex items-center gap-4 text-[10px] text-[#5d6f7e]">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
          <span className="ml-auto">{allResults.length} loan{allResults.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
