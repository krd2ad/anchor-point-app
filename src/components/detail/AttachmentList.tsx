import type { Attachment } from '../../types';

interface AttachmentListProps {
  attachments: Attachment[];
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

export function AttachmentList({ attachments }: AttachmentListProps) {
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
    </div>
  );
}
