import { useState, useEffect, useRef } from 'react';
import type { Comment } from '../../types';
import { STAGES } from '../../data/stages';
import { useLoanService } from '../../context/LoanServiceProvider';

interface CommentComposerProps {
  loanId: string;
  currentStageId: string;
  onCommentAdded: (c: Comment) => void;
  initialBody?: string;
  onInitialBodyConsumed?: () => void;
}

export function CommentComposer({ loanId, currentStageId, onCommentAdded, initialBody, onInitialBodyConsumed }: CommentComposerProps) {
  const service = useLoanService();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When a reply prefix is injected, pre-fill the textarea and focus it
  useEffect(() => {
    if (initialBody) {
      setBody(initialBody);
      textareaRef.current?.focus();
      // Place cursor at end
      const len = initialBody.length;
      textareaRef.current?.setSelectionRange(len, len);
      onInitialBodyConsumed?.();
    }
  }, [initialBody, onInitialBodyConsumed]);

  const stage = STAGES.find((s) => s.id === currentStageId);

  async function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const comment = await service.addComment(loanId, currentStageId, trimmed);
      onCommentAdded(comment);
      setBody('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 space-y-2">
      <textarea
        ref={textareaRef}
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment…"
        className="w-full bg-[#1d2125] border border-[#3d4b5c] rounded-md px-3 py-2 text-sm text-[#b6c2cf] placeholder-[#5a6878] resize-none focus:outline-none focus:border-[#579dff] transition-colors"
      />

      <div className="flex items-center justify-between gap-2">
        {stage && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: stage.color + '33',
              color: stage.color,
              border: `1px solid ${stage.color}55`,
            }}
          >
            Tagged: {stage.name}
          </span>
        )}

        <button
          onClick={handleSubmit}
          disabled={!body.trim() || submitting}
          className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-md bg-[#579dff] text-white hover:bg-[#4d8ee0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Adding…' : 'Add Comment'}
        </button>
      </div>
    </div>
  );
}
