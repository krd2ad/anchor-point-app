import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { STAGES } from '../../data/stages';
import { STAGE_STEPS } from '../../data/stageSteps';
import { useLoans, useSelectedLoan, useLoanService } from '../../context/LoanServiceProvider';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../shared/Toast';
import { exportLoansAsCsv } from '../../lib/exportCsv';
import { dueActions } from '../../lib/dates';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { BoardHeader, type AppView } from './BoardHeader';
import { PortfolioBar } from './PortfolioBar';
import { FilterBar, type BoardFilters, DEFAULT_FILTERS, filtersAreActive } from './FilterBar';
import { StageColumn } from './StageColumn';
import { LoanCard } from './LoanCard';
import { BulkActionBar } from './BulkActionBar';
import { NewLoanModal } from './NewLoanModal';
import { LoanCompareModal } from './LoanCompareModal';
import { PrintView } from './PrintView';
import { KeyboardShortcutsModal } from '../shared/KeyboardShortcutsModal';
import { loanRiskScore } from '../../lib/riskScore';
import type { Loan } from '../../types';

// Stage orders that require critical closing gates to be cleared
const FUNDED_STAGE_ORDER = 4; // Servicing Setup and beyond

interface PendingDrag {
  loanId: string;
  newStageId: string;
  unmetGateLabels: string[];
}

function CriticalGateDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingDrag;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-[#22272b] border border-[#f87168] rounded-xl shadow-2xl w-[420px] mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#f87168]/20 border border-[#f87168]/40 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 text-[#f87168]">
              <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 7v4M10 13h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <h3 className="text-[#e8ecf0] font-semibold text-sm">Critical Closing Gates Unmet</h3>
            <p className="text-[#f87168] text-xs mt-0.5">Fund anyway?</p>
          </div>
        </div>

        <p className="text-[#b6c2cf] text-sm mb-3 leading-relaxed">
          The following required steps are not complete:
        </p>
        <ul className="mb-5 space-y-1.5">
          {pending.unmetGateLabels.map((label) => (
            <li key={label} className="flex items-center gap-2 text-sm text-[#f87168]">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0">
                <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
              </svg>
              {label}
            </li>
          ))}
        </ul>

        <p className="text-[#7a8899] text-xs mb-5">
          This override will be logged as a comment on the loan. The move is not reversible without manually dragging the card back.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm text-[#b6c2cf] bg-[#2d3748] hover:bg-[#3d4b5c] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#f87168] hover:bg-[#e55b52] transition-colors"
          >
            Override &amp; Fund
          </button>
        </div>
      </div>
    </div>
  );
}

// Critical step IDs in Title & Closing
const CRITICAL_STEP_IDS = new Set(
  STAGE_STEPS.filter(s => s.severity === 'critical' && s.stageId === 'stage-3').map(s => s.id)
);

interface BoardProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Board({ currentView, onViewChange }: BoardProps) {
  const { loans, loading, refreshLoans } = useLoans();
  const { selectedLoanId, selectLoan, clearSelection } = useSelectedLoan();
  const service = useLoanService();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { open: openCommandPalette } = useCommandPalette();

  const [stageOverrides, setStageOverrides] = useState<Map<string, string>>(new Map());
  const [starOverrides, setStarOverrides] = useState<Map<string, boolean>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [selectedLoanIds, setSelectedLoanIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_FILTERS);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  const [showShortcuts, setShowShortcuts] = useState(false);

  const allCollapsed = collapsedStages.size === STAGES.length;
  const handleToggleCollapse = useCallback((stageId: string) => {
    setCollapsedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }, []);
  const handleCollapseAll = useCallback(() => {
    if (allCollapsed) {
      setCollapsedStages(new Set());
    } else {
      setCollapsedStages(new Set(STAGES.map(s => s.id)));
    }
  }, [allCollapsed]);

  // Keyboard navigation state
  const [keyboardFocusedLoanId, setKeyboardFocusedLoanId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const ZOOM_STEPS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const [zoom, setZoom] = useState(0.8);
  const zoomIn    = useCallback(() => setZoom(z => ZOOM_STEPS[Math.min(ZOOM_STEPS.indexOf(z) + 1, ZOOM_STEPS.length - 1)]), []);
  const zoomOut   = useCallback(() => setZoom(z => ZOOM_STEPS[Math.max(ZOOM_STEPS.indexOf(z) - 1, 0)]), []);
  const zoomReset = useCallback(() => setZoom(1.0), []);

  const handleBulkToggle = useCallback((loanId: string) => {
    // Close detail panel if open
    if (selectedLoanId !== null) {
      clearSelection();
    }
    setSelectedLoanIds((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) {
        next.delete(loanId);
      } else {
        next.add(loanId);
      }
      return next;
    });
  }, [selectedLoanId, clearSelection]);

  const handleBulkMoveToStage = useCallback((newStageId: string) => {
    const stageName = STAGES.find(s => s.id === newStageId)?.name ?? newStageId;
    const count = selectedLoanIds.size;
    selectedLoanIds.forEach((loanId) => {
      setStageOverrides((prev) => new Map(prev).set(loanId, newStageId));
      service.moveLoanToStage(loanId, newStageId);
    });
    setSelectedLoanIds(new Set());
    showToast(`${count} loan${count !== 1 ? 's' : ''} moved to ${stageName}`, 'success');
  }, [selectedLoanIds, service, showToast]);

  const handleBulkClear = useCallback(() => {
    setSelectedLoanIds(new Set());
  }, []);

  const handleStarToggled = useCallback((updatedLoan: Loan) => {
    // Optimistic override so column re-sorts immediately (use the new value from the service)
    setStarOverrides((prev) => new Map(prev).set(updatedLoan.id, updatedLoan.isStarred ?? false));
    // Refresh provider loans so CommandPalette and other consumers see the updated isStarred
    refreshLoans();
  }, [refreshLoans]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
      if (e.key === '-')                  { e.preventDefault(); zoomOut(); }
      if (e.key === '0')                  { e.preventDefault(); zoomReset(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomIn, zoomOut, zoomReset]);

  // Board keyboard navigation — only active when no modal/panel is open
  useEffect(() => {
    if (loading) return;

    function handleBoardKey(e: KeyboardEvent) {
      // Don't activate if a modal is open, if detail panel is open, or if focus is inside an input
      if (showNewLoanModal) return;
      if (pendingDrag) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT') return;

      // ? key opens keyboard shortcuts modal (only when no modal is open)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !showShortcuts) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      const isPanelOpen = selectedLoanId !== null;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (isPanelOpen) {
          clearSelection();
        } else {
          setKeyboardFocusedLoanId(null);
        }
        return;
      }

      // If panel is open, don't handle arrow/enter keys (let the panel manage itself)
      if (isPanelOpen) return;

      // Build stageLoans map (same as the render logic)
      const stageLoanMap = new Map<string, Loan[]>();
      for (const stage of STAGES) {
        stageLoanMap.set(
          stage.id,
          loans.filter((l) => (stageOverrides.get(l.id) ?? l.stageId) === stage.id)
        );
      }

      // Find which stage/index the currently focused loan is in
      let focusedStageIdx = -1;
      let focusedCardIdx = -1;

      if (keyboardFocusedLoanId) {
        for (let si = 0; si < STAGES.length; si++) {
          const stageLoans = stageLoanMap.get(STAGES[si].id) ?? [];
          const ci = stageLoans.findIndex((l) => l.id === keyboardFocusedLoanId);
          if (ci !== -1) {
            focusedStageIdx = si;
            focusedCardIdx = ci;
            break;
          }
        }
      }

      // Default focus to first non-empty stage if nothing focused
      if (focusedStageIdx === -1) {
        const firstNonEmpty = STAGES.findIndex((s) => (stageLoanMap.get(s.id)?.length ?? 0) > 0);
        focusedStageIdx = firstNonEmpty !== -1 ? firstNonEmpty : 0;
        focusedCardIdx = 0;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        let nextStageIdx = (focusedStageIdx + dir + STAGES.length) % STAGES.length;
        // Wrap until we find a non-empty stage (or exhaust all)
        let attempts = STAGES.length;
        while ((stageLoanMap.get(STAGES[nextStageIdx].id)?.length ?? 0) === 0 && attempts-- > 0) {
          nextStageIdx = (nextStageIdx + dir + STAGES.length) % STAGES.length;
        }
        const nextLoans = stageLoanMap.get(STAGES[nextStageIdx].id) ?? [];
        const clampedCardIdx = Math.min(focusedCardIdx, nextLoans.length - 1);
        if (nextLoans.length > 0) {
          setKeyboardFocusedLoanId(nextLoans[Math.max(0, clampedCardIdx)].id);
        }
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const stageLoans = stageLoanMap.get(STAGES[focusedStageIdx].id) ?? [];
        if (stageLoans.length === 0) return;
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        const nextCardIdx = Math.max(0, Math.min(stageLoans.length - 1, focusedCardIdx + dir));
        setKeyboardFocusedLoanId(stageLoans[nextCardIdx].id);
      }

      if (e.key === 'Enter' || e.key === ' ') {
        if (keyboardFocusedLoanId) {
          e.preventDefault();
          selectLoan(keyboardFocusedLoanId);
        }
      }
    }

    const boardEl = boardRef.current;
    if (boardEl) {
      boardEl.addEventListener('keydown', handleBoardKey);
      return () => boardEl.removeEventListener('keydown', handleBoardKey);
    }
    // Fallback: listen on window so keyboard nav works even without explicit focus
    window.addEventListener('keydown', handleBoardKey);
    return () => window.removeEventListener('keydown', handleBoardKey);
  }, [
    loading,
    loans,
    stageOverrides,
    keyboardFocusedLoanId,
    selectedLoanId,
    selectLoan,
    clearSelection,
    showNewLoanModal,
    pendingDrag,
    showShortcuts,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeLoan: Loan | undefined = activeId
    ? loans.find((l) => l.id === activeId)
    : undefined;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const loanId = active.id as string;
    const newStageId = over.id as string;
    const currentStageId = stageOverrides.get(loanId) ?? loans.find((l) => l.id === loanId)?.stageId;
    if (currentStageId === newStageId) return;

    const newStageOrder = STAGES.find(s => s.id === newStageId)?.order ?? 0;
    const prevStageOrder = STAGES.find(s => s.id === currentStageId)?.order ?? 0;

    // Check critical closing gates when moving into Servicing Setup or beyond
    if (newStageOrder >= FUNDED_STAGE_ORDER && prevStageOrder < FUNDED_STAGE_ORDER) {
      const statuses = await service.getStepStatuses(loanId);
      const doneStepIds = new Set(
        statuses.filter(ss => ss.status === 'done').map(ss => ss.stepId)
      );

      const unmetGates = STAGE_STEPS.filter(
        s => CRITICAL_STEP_IDS.has(s.id) && !doneStepIds.has(s.id)
      );

      if (unmetGates.length > 0) {
        setPendingDrag({ loanId, newStageId, unmetGateLabels: unmetGates.map(s => s.label) });
        return;
      }
    }

    commitMove(loanId, newStageId, currentStageId, false);
  }

  const commitMove = useCallback((loanId: string, newStageId: string, fromStageId: string | undefined, wasOverride: boolean) => {
    setStageOverrides((prev) => new Map(prev).set(loanId, newStageId));
    service.moveLoanToStage(loanId, newStageId);

    // Auto-log override comment only when critical gates were explicitly overridden
    if (wasOverride && fromStageId === 'stage-3') {
      service.addComment(
        loanId,
        newStageId,
        '⚠️ Funding override: loan moved to Servicing Setup with one or more critical closing gates unmet. Review required.',
      );
      showToast('Override logged as comment', 'warning');
    }
  }, [service, showToast]);

  function handleConfirmOverride() {
    if (!pendingDrag) return;
    const fromStage = stageOverrides.get(pendingDrag.loanId) ?? loans.find(l => l.id === pendingDrag.loanId)?.stageId;
    commitMove(pendingDrag.loanId, pendingDrag.newStageId, fromStage, true);
    setPendingDrag(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <p className="text-[#b6c2cf] text-sm animate-pulse">Loading loans…</p>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const dueActionsCount = loans.filter(
    (l) => dueActions(stageOverrides.get(l.id) ?? l.stageId, l.firstPaymentDate, today).length > 0
  ).length;
  const dueActionItems = loans
    .flatMap((l) => {
      const effectiveStageId = stageOverrides.get(l.id) ?? l.stageId;
      const actions = dueActions(effectiveStageId, l.firstPaymentDate, today);
      return actions.map((a) => ({ label: l.displayLabel, reason: a.reason }));
    });

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="min-h-screen bg-[#1d2125] flex flex-col">
          <BoardHeader
            zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onZoomReset={zoomReset}
            currentView={currentView} onViewChange={onViewChange}
            onNewLoan={() => setShowNewLoanModal(true)}
            onExportCsv={() => exportLoansAsCsv(loans, STAGES)}
            onPrint={() => window.print()}
            dueActionsCount={dueActionsCount}
            dueActionItems={dueActionItems}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenCommandPalette={openCommandPalette}
            onShowShortcuts={() => setShowShortcuts(true)}
          />

          {currentView === 'board' && (
            <PortfolioBar loans={loans} />
          )}

          {currentView === 'board' && (
            <div className="flex items-center gap-0">
              <FilterBar
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(DEFAULT_FILTERS)}
              />
              <div className="ml-auto pr-4 flex-shrink-0">
                <button
                  onClick={handleCollapseAll}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#454f59] text-[#5d6f7e] hover:border-[#6b7a8d] hover:text-[#8c9bab] transition-all duration-100 leading-none whitespace-nowrap"
                  title={allCollapsed ? 'Expand all columns' : 'Collapse all columns'}
                >
                  <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                    {allCollapsed ? (
                      <path d="M2 4l3 3 3-3M2 8h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M2 8l3-3 3 3M2 4h8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    )}
                  </svg>
                  {allCollapsed ? 'Expand all' : 'Collapse all'}
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-x-auto">
            <div ref={boardRef} className="flex items-start px-2 py-4" style={{ minWidth: 'max-content', zoom }} tabIndex={-1}>
              {STAGES.map((stage) => {
                const allStageLoans = loans.filter(
                  (l) => (stageOverrides.get(l.id) ?? l.stageId) === stage.id
                );

                // Apply filters
                const activeFilters = filtersAreActive(filters);
                const stageLoans = activeFilters
                  ? allStageLoans.filter((loan) => {
                      // Entity filter
                      if (filters.entity !== 'all' && loan.lendingEntity !== filters.entity) return false;

                      // Risk filter
                      if (filters.risk !== 'all') {
                        const riskLevel = loanRiskScore(loan).level;
                        if (filters.risk === 'critical' && riskLevel !== 'critical') return false;
                        if (filters.risk === 'high' && riskLevel !== 'high' && riskLevel !== 'critical') return false;
                        if (filters.risk === 'medium' && riskLevel === 'low') return false;
                      }

                      // Unmet gates filter — show stage-3 loans only (conservative approximation)
                      if (filters.hasUnmetGates && stage.id !== 'stage-3') return false;

                      return true;
                    })
                  : allStageLoans;

                const hiddenCount = allStageLoans.length - stageLoans.length;

                return (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    loans={stageLoans}
                    selectedLoanId={selectedLoanId}
                    onSelectLoan={(id) => {
                      setSelectedLoanIds(new Set());
                      selectLoan(id);
                    }}
                    activeId={activeId}
                    stageOverrides={stageOverrides}
                    keyboardFocusedLoanId={keyboardFocusedLoanId}
                    selectedLoanIds={selectedLoanIds}
                    onBulkToggle={handleBulkToggle}
                    hiddenCount={hiddenCount}
                    starOverrides={starOverrides}
                    onStarToggled={handleStarToggled}
                    onMovedToStage={(loanId, stageId) => {
                      setStageOverrides(prev => new Map(prev).set(loanId, stageId));
                      service.moveLoanToStage(loanId, stageId);
                      showToast(`Moved to ${STAGES.find(s => s.id === stageId)?.name}`, 'success');
                    }}
                    collapsed={collapsedStages.has(stage.id)}
                    onToggleCollapse={() => handleToggleCollapse(stage.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeLoan ? (
            <LoanCard
              loan={activeLoan}
              isSelected={false}
              onSelect={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {pendingDrag && (
        <CriticalGateDialog
          pending={pendingDrag}
          onConfirm={handleConfirmOverride}
          onCancel={() => setPendingDrag(null)}
        />
      )}

      {showNewLoanModal && (
        <NewLoanModal onClose={() => setShowNewLoanModal(false)} />
      )}

      <BulkActionBar
        count={selectedLoanIds.size}
        selectedLoanIds={selectedLoanIds}
        onMoveToStage={handleBulkMoveToStage}
        onClear={handleBulkClear}
        onCompare={() => setShowCompareModal(true)}
      />

      {showCompareModal && (
        <LoanCompareModal
          loanIds={[...selectedLoanIds]}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Hidden on screen; visible only when printing */}
      <PrintView />
    </>
  );
}
