import type { Attachment } from '../../types';

interface AttachmentListProps {
  attachments: Attachment[];
  onOpenInFiles?: () => void;
}

const STATUS_STYLES: Record<Attachment['status'], string> = {
  requested: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  received:  'bg-blue-500/20  text-blue-300  border border-blue-500/40',
  verified:  'bg-green-500/20 text-green-300  border border-green-500/40',
  waived:    'bg-[#3d4b5c]    text-[#7a8899] border border-[#3d4b5c]',
};

const STATUS_LABELS: Record<Attachment['status'], string> = {
  requested: 'Requested',
  received:  'Received',
  verified:  'Verified',
  waived:    'Waived',
};

export function AttachmentList({ attachments, onOpenInFiles }: AttachmentListProps) {
  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf] mb-3">
        Attachments
      </h3>
      {attachments.length === 0 ? (
        <p className="text-sm text-[#7a8899] italic">No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-2 text-sm text-[#b6c2cf]"
            >
              <span className="text-base flex-shrink-0">📎</span>
              <span className="flex-1 truncate">{att.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#3d4b5c] text-[#b6c2cf]">
                {att.kind}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${STATUS_STYLES[att.status]}`}
              >
                {STATUS_LABELS[att.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
      {onOpenInFiles && (
        <button
          onClick={onOpenInFiles}
          className="mt-4 flex items-center gap-1.5 text-xs text-[#579dff] hover:text-[#85b8ff] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M2 4a1 1 0 011-1h4l2 2h5a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.25"/>
          </svg>
          Open in Files
        </button>
      )}
    </div>
  );
}
