import { useEffect, useRef, useState, useCallback } from 'react';
import { useLoanService } from '../../context/LoanServiceProvider';

interface LoanNoteProps {
  loanId: string;
}

export function LoanNote({ loanId }: LoanNoteProps) {
  const service = useLoanService();
  const [body, setBody] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load note on mount / loanId change
  useEffect(() => {
    setLoaded(false);
    service.getNote(loanId).then((note) => {
      setBody(note?.body ?? '');
      setLoaded(true);
    });
  }, [loanId, service]);

  // Auto-resize textarea
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    autoResize();
  }, [body, loaded]);

  const save = useCallback(
    (value: string) => {
      service.saveNote(loanId, value).then(() => {
        setSavedIndicator(true);
        if (indicatorRef.current) clearTimeout(indicatorRef.current);
        indicatorRef.current = setTimeout(() => setSavedIndicator(false), 2000);
      });
    },
    [loanId, service]
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
    autoResize();
    // Debounced save on change (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(e.target.value), 300);
  }

  function handleBlur() {
    // Flush any pending debounce immediately on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    save(body);
  }

  return (
    <div className="px-4 py-3">
      {/* Section header */}
      <div className="flex items-center gap-1.5 mb-2">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#b6c2cf] flex-shrink-0">
          <path
            d="M11.5 2.5a1.5 1.5 0 012.121 2.121l-8 8a1 1 0 01-.354.236l-3 1a.5.5 0 01-.636-.636l1-3a1 1 0 01.236-.354l8-8z"
            stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf]">Notes</h3>
        {savedIndicator && (
          <span className="ml-auto text-[10px] text-[#4bce97] opacity-80 transition-opacity">
            Saved
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={body}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add private notes for this loan…"
        rows={3}
        className={[
          'w-full rounded-md p-3 text-sm text-[#b6c2cf] resize-none overflow-hidden',
          'bg-[#1d2125] border border-[#2d3748]',
          'placeholder:text-[#4d5f6e] placeholder:italic',
          'focus:outline-none focus:border-[#454f59] transition-colors',
        ].join(' ')}
        style={{ minHeight: '72px' }}
      />
    </div>
  );
}
