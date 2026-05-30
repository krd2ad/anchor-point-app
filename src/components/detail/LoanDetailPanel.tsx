import { useEffect, useState, useCallback } from 'react';
import type { LoanDetail, Comment } from '../../types';
import { useSelectedLoan, useLoanService } from '../../context/LoanServiceProvider';
import { LoanSummary } from './LoanSummary';
import { StageStepChecklist } from './StageStepChecklist';
import { StageSwitcher } from './StageSwitcher';
import { CommentList } from './CommentList';
import { CommentComposer } from './CommentComposer';
import { AttachmentList } from './AttachmentList';
import { dueActions } from '../../lib/dates';

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
  const { selectedLoanId, clearSelection } = useSelectedLoan();
  const service = useLoanService();

  const [loanDetail, setLoanDetail] = useState<LoanDetail | null>(null);
  const [loading, setLoading]       = useState(false);
  const [comments, setComments]     = useState<Comment[]>([]);
  // Track whether we're actually open (for animation purposes)
  const [isOpen, setIsOpen]         = useState(false);
  // Reply prefix for the composer (set by CommentList → cleared after CommentComposer consumes it)
  const [replyPrefix, setReplyPrefix] = useState<string | undefined>(undefined);

  const handleReply = useCallback((prefix: string) => {
    setReplyPrefix(prefix);
  }, []);

  // Fetch loan detail whenever selectedLoanId changes
  useEffect(() => {
    if (!selectedLoanId) {
      setIsOpen(false);
      setLoanDetail(null);
      setComments([]);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    service.getLoan(selectedLoanId).then((detail) => {
      setLoanDetail(detail);
      setComments(detail.comments);
      setLoading(false);
    });
  }, [selectedLoanId, service]);

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
        <div className="flex items-center justify-between p-4 sticky top-0 bg-[#282e33] z-10 border-b border-[#3d4b5c]">
          <h2 className="text-sm font-semibold text-[#e8ecf0]">Loan Detail</h2>
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

        {/* Panel body */}
        {loading || !loanDetail ? (
          <Spinner />
        ) : (
          <div className="flex-1">
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
          </div>
        )}
      </div>
    </>
  );
}
