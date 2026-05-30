import { useEffect, useState, useCallback, useMemo } from 'react';
import type { LoanDetail, Comment, StageChangeEvent } from '../../types';
import { useSelectedLoan, useLoanService, useLoans } from '../../context/LoanServiceProvider';
import { LoanSummary } from './LoanSummary';
import { LoanHealthStrip } from './LoanHealthStrip';
import { StageStepChecklist } from './StageStepChecklist';
import { StageSwitcher } from './StageSwitcher';
import { CommentList } from './CommentList';
import { CommentComposer } from './CommentComposer';
import { AttachmentList } from './AttachmentList';
import { ActivityTimeline } from './ActivityTimeline';
import { LoanNote } from './LoanNote';
import { UnderwritingWidget } from './UnderwritingWidget';
import { StageJourney } from './StageJourney';
import { PaymentCalendar } from './PaymentCalendar';
import { DrawProgramWidget } from './DrawProgramWidget';
import { LoanSummarySheet } from './LoanSummarySheet';
import { dueActions } from '../../lib/dates';
import { STAGES } from '../../data/stages';

function Divider() {
  return <div className="border-t border-[#3d4b5c]" />;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <span className="animate-spin h-8 w-8 border-4 border-[#3d4b5c] border-t-[#579dff] rounded-full" />
    </div>
  );
}

interface LoanDetailPanelProps {
  onOpenInFiles?: () => void;
}

export function LoanDetailPanel({ onOpenInFiles }: LoanDetailPanelProps) {
  const { selectedLoanId, selectLoan, clearSelection } = useSelectedLoan();
  const service = useLoanService();
  const { loans } = useLoans();

  // Sorted loan IDs for prev/next navigation (stage order, then displayLabel)
  const sortedLoanIds = useMemo(() =>
    [...loans]
      .sort((a, b) => {
        const so = STAGES.findIndex(s => s.id === a.stageId) - STAGES.findIndex(s => s.id === b.stageId);
        return so !== 0 ? so : a.displayLabel.localeCompare(b.displayLabel);
      })
      .map(l => l.id),
    [loans]
  );

  const currentIndex = selectedLoanId ? sortedLoanIds.indexOf(selectedLoanId) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < sortedLoanIds.length - 1;

  function handlePrev() {
    if (hasPrev) selectLoan(sortedLoanIds[currentIndex - 1]);
  }
  function handleNext() {
    if (hasNext) selectLoan(sortedLoanIds[currentIndex + 1]);
  }

  const [loanDetail, setLoanDetail] = useState<LoanDetail | null>(null);
  const [loading, setLoading]       = useState(false);
  const [comments, setComments]     = useState<Comment[]>([]);
  const [stageHistory, setStageHistory] = useState<StageChangeEvent[]>([]);
  // Track whether we're actually open (for animation purposes)
  const [isOpen, setIsOpen]         = useState(false);
  // Reply prefix for the composer (set by CommentList → cleared after CommentComposer consumes it)
  const [replyPrefix, setReplyPrefix] = useState<string | undefined>(undefined);
  // Star state (separate so it can be toggled without re-fetching full detail)
  const [isStarred, setIsStarred]   = useState(false);
  // Summary sheet state
  const [showSummarySheet, setShowSummarySheet] = useState(false);

  const handleReply = useCallback((prefix: string) => {
    setReplyPrefix(prefix);
  }, []);

  // Fetch loan detail whenever selectedLoanId changes
  useEffect(() => {
    if (!selectedLoanId) {
      setIsOpen(false);
      setLoanDetail(null);
      setComments([]);
      setStageHistory([]);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    Promise.all([
      service.getLoan(selectedLoanId),
      service.getStageHistory(selectedLoanId),
    ]).then(([detail, history]) => {
      setLoanDetail(detail);
      setComments(detail.comments);
      setStageHistory(history);
      setIsStarred(detail.loan.isStarred ?? false);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load loan detail:', err);
      setLoading(false);
    });
  }, [selectedLoanId, service]);

  function handleToggleStar() {
    if (!selectedLoanId) return;
    service.toggleStar(selectedLoanId).then((updated) => {
      setIsStarred(updated.isStarred ?? false);
    });
  }

  // Don't render the overlay/panel at all when nothing is selected
  if (!selectedLoanId) return null;

  function handleResolve(id: string) {
    service.resolveComment(id).then((updated) => {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    });
  }

  function handleUnresolve(id: string) {
    service.unresolveComment(id).then((updated) => {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    });
  }

  function handleCommentAdded(c: Comment) {
    setComments((prev) => [c, ...prev]);
  }

  return (
    <>
      {/* Summary sheet modal */}
      {showSummarySheet && loanDetail && (
        <LoanSummarySheet
          loanDetail={loanDetail}
          stageHistory={stageHistory}
          onClose={() => setShowSummarySheet(false)}
        />
      )}

      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={clearSelection}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-[480px] z-50 bg-[#282e33] overflow-y-auto flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header with close button */}
        <div className="flex items-center justify-between px-4 py-2.5 sticky top-0 bg-[#282e33] z-10 border-b border-[#3d4b5c]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#e8ecf0]">Loan Detail</h2>
            {/* Prev / Next navigation */}
            {sortedLoanIds.length > 1 && currentIndex >= 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors text-[11px] ${
                    hasPrev
                      ? 'text-[#8c9bab] hover:text-[#e8ecf0] hover:bg-[#3d4b5c]'
                      : 'text-[#3d4b5c] cursor-not-allowed'
                  }`}
                  aria-label="Previous loan"
                  title="Previous loan"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M7.5 2.5l-4 3.5 4 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="text-[10px] text-[#5d6f7e] tabular-nums">
                  {currentIndex + 1}/{sortedLoanIds.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                    hasNext
                      ? 'text-[#8c9bab] hover:text-[#e8ecf0] hover:bg-[#3d4b5c]'
                      : 'text-[#3d4b5c] cursor-not-allowed'
                  }`}
                  aria-label="Next loan"
                  title="Next loan"
                >
                  <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                    <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Summary sheet button */}
            {loanDetail && (
              <button
                onClick={() => setShowSummarySheet(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md transition-colors text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c]"
                aria-label="Open loan summary sheet"
                title="Summary sheet"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <rect x="3" y="1.5" width="10" height="13" rx="1.25" stroke="currentColor" strokeWidth="1.25"/>
                  <path d="M5.5 5h5M5.5 7.5h5M5.5 10h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
              </button>
            )}
            {/* Star button */}
            <button
              onClick={handleToggleStar}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[#3d4b5c]"
              aria-label={isStarred ? 'Unstar loan' : 'Star loan'}
              title={isStarred ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isStarred ? (
                <svg viewBox="0 0 16 16" fill="#f5cd47" className="w-4 h-4 text-[#f5cd47]">
                  <path d="M8 1.5l1.84 3.73 4.12.6-2.98 2.9.7 4.1L8 10.77l-3.68 1.93.7-4.1L2.04 5.83l4.12-.6L8 1.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#5d6f7e] hover:text-[#f5cd47] transition-colors">
                  <path d="M8 1.5l1.84 3.73 4.12.6-2.98 2.9.7 4.1L8 10.77l-3.68 1.93.7-4.1L2.04 5.83l4.12-.6L8 1.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              onClick={clearSelection}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] transition-colors"
              aria-label="Close panel"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel body */}
        {loading || !loanDetail ? (
          <Spinner />
        ) : (
          <div className="flex-1">
            {/* Health strip — risk, LTV, docs, autopay */}
            <LoanHealthStrip loan={loanDetail.loan} />

            {/* Due actions banner */}
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              const actions = dueActions(loanDetail.loan.stageId, loanDetail.loan.firstPaymentDate, today);
              if (actions.length === 0) return null;
              return (
                <div className="mx-4 mt-3 mb-1 p-2.5 rounded-md bg-[#f5cd47]/10 border border-[#f5cd47]/30">
                  <p className="text-xs font-semibold text-[#f5cd47] mb-1 flex items-center gap-1.5">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0">
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25"/>
                      <path d="M6 4v3M6 8.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
                    </svg>
                    Action due today
                  </p>
                  {actions.map(a => (
                    <p key={a.stepId} className="text-[11px] text-[#b6a936] leading-snug">{a.reason} — {a.label}</p>
                  ))}
                </div>
              );
            })()}

            {/* Payment calendar — servicing/collecting/special-servicing loans */}
            <PaymentCalendar loan={loanDetail.loan} />

            {/* Draw program tracker — only for loans with hasDrawProgram */}
            {loanDetail.loan.hasDrawProgram && (
              <>
                <DrawProgramWidget loanId={loanDetail.loan.id} loan={loanDetail.loan} />
                <Divider />
              </>
            )}

            {/* Summary */}
            <LoanSummary
              loan={loanDetail.loan}
              borrowerEntity={loanDetail.borrowerEntity}
              principal={loanDetail.principal}
              parcels={loanDetail.parcels}
            />

            <Divider />

            {/* Current stage checklist */}
            <StageStepChecklist
              loanId={loanDetail.loan.id}
              stageId={loanDetail.loan.stageId}
              isCurrentStage={true}
              onStepStatusChanged={() => {
                // Re-fetch comments so auto-logged "sent" comments appear immediately
                service.getLoan(loanDetail.loan.id).then(d => setComments(d.comments));
              }}
            />

            <Divider />

            {/* Notes */}
            <LoanNote loanId={loanDetail.loan.id} />

            <Divider />

            {/* Underwriting quick view — stage-1 and stage-2 only */}
            {(loanDetail.loan.stageId === 'stage-1' || loanDetail.loan.stageId === 'stage-2') && (
              <>
                <UnderwritingWidget loanId={loanDetail.loan.id} />
                <Divider />
              </>
            )}

            {/* Stage switcher (all 7 stages, browsable) */}
            <StageSwitcher
              loanId={loanDetail.loan.id}
              currentStageId={loanDetail.loan.stageId}
            />

            <Divider />

            {/* Comments */}
            <div>
              <div className="px-4 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf]">
                  Comments
                </h3>
              </div>
              <CommentList
                comments={comments}
                onResolve={handleResolve}
                onUnresolve={handleUnresolve}
                onReply={handleReply}
              />
              <CommentComposer
                loanId={loanDetail.loan.id}
                currentStageId={loanDetail.loan.stageId}
                onCommentAdded={handleCommentAdded}
                initialBody={replyPrefix}
                onInitialBodyConsumed={() => setReplyPrefix(undefined)}
              />
            </div>

            <Divider />

            {/* Attachments */}
            <AttachmentList attachments={loanDetail.attachments} onOpenInFiles={onOpenInFiles} />

            <Divider />

            {/* Stage journey visualization */}
            <StageJourney loan={loanDetail.loan} stageHistory={stageHistory} />

            <Divider />

            {/* Activity timeline */}
            <ActivityTimeline
              comments={comments}
              stepStatuses={loanDetail.stepStatuses}
              stageHistory={stageHistory}
            />
          </div>
        )}
      </div>
    </>
  );
}
