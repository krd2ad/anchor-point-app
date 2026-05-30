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

function FileIcon({ fileType }: { fileType: Attachment['fileType'] }) {
  const isImage = fileType === 'jpg' || fileType === 'png';
  const isDoc   = fileType === 'docx';
  const isSheet = fileType === 'xlsx';
  const color   = isImage ? '#4bce97' : isDoc ? '#579dff' : isSheet ? '#4bce97' : '#f87168';
  const label   = fileType.toUpperCase();

  return (
    <span
      className="text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0 leading-none border"
      style={{ color, backgroundColor: color + '20', borderColor: color + '44' }}
    >
      {label}
    </span>
  );
}

export function AttachmentList({ attachments, onOpenInFiles }: AttachmentListProps) {
  // Group by category for display
  const grouped = new Map<string, Attachment[]>();
  for (const att of attachments) {
    const cat = att.category ?? 'Other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(att);
  }

  const categories = [...grouped.keys()];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf]">
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1.5 text-[#7a8899] font-normal normal-case">({attachments.length})</span>
          )}
        </h3>
        {onOpenInFiles && (
          <button
            onClick={onOpenInFiles}
            className="flex items-center gap-1 text-xs text-[#579dff] hover:text-[#85b8ff] transition-colors"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
              <path d="M2 4a1 1 0 011-1h3l1.5 1.5H11a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.25"/>
            </svg>
            Open in Files
          </button>
        )}
      </div>

      {attachments.length === 0 ? (
        <p className="text-sm text-[#7a8899] italic">No attachments yet.</p>
      ) : categories.length === 1 ? (
        // Single category — flat list
        <ul className="space-y-2">
          {attachments.map(att => (
            <AttachmentRow key={att.id} att={att} showCategory={false} />
          ))}
        </ul>
      ) : (
        // Multiple categories — grouped
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-wider text-[#5d6f7e] mb-1.5">{cat}</p>
              <ul className="space-y-1.5">
                {grouped.get(cat)!.map(att => (
                  <AttachmentRow key={att.id} att={att} showCategory={false} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentRow({ att, showCategory }: { att: Attachment; showCategory: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[#b6c2cf]">
      <FileIcon fileType={att.fileType} />
      <span className="flex-1 truncate text-xs">{att.name}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_STYLES[att.status]}`}>
        {STATUS_LABELS[att.status]}
      </span>
    </li>
  );
}
