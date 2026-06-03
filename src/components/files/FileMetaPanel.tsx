import type { FileTreeNode } from '../../lib/fileTree';
import type { Attachment } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  verified:  'bg-green-500/20 text-green-400 border-green-500/30',
  received:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  requested: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  waived:    'bg-[#3d4b5c] text-[#7a8899] border-[#3d4b5c]',
};

function fmtSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000)     return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


function MockPreview({ att }: { att: Attachment }) {
  const isImage = att.fileType === 'jpg' || att.fileType === 'png';

  if (isImage) {
    return (
      <div className="rounded-md bg-[#1d2125] border border-[#3d4b5c] h-32 flex flex-col items-center justify-center gap-2">
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 text-green-400/60">
          <rect x="3" y="6" width="34" height="28" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 26l9-9 7 7 5-5 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="13" cy="15" r="3" fill="currentColor" fillOpacity="0.4"/>
        </svg>
        <p className="text-xs text-[#7a8899]">ID Document — image placeholder</p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-[#1d2125] border border-[#3d4b5c] h-32 flex flex-col items-center justify-center gap-2">
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 text-red-400/60">
        <path d="M8 4h16l8 8v24a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M24 4v8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 20h14M13 25h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      </svg>
      <p className="text-xs text-[#7a8899] italic">Preview not available in POC</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">{label}</span>
      <span className="text-sm text-[#e8ecf0]">{value || '—'}</span>
    </div>
  );
}

interface FileMetaPanelProps {
  node: FileTreeNode & { kind: 'file' };
  tree: FileTreeNode[];
  onClose: () => void;
  onViewInBoard: (loanId: string) => void;
}

export function FileMetaPanel({ node, tree, onClose, onViewInBoard }: FileMetaPanelProps) {
  const att = node.attachment;

  // Find parent loan
  let parentLoanId: string | null = null;
  let parentLoanName: string | null = null;
  for (const loanNode of tree) {
    if (loanNode.kind !== 'loan') continue;
    for (const catNode of loanNode.children) {
      if (catNode.kind !== 'category') continue;
      if (catNode.children.some(f => f.id === node.id)) {
        parentLoanId   = loanNode.loanId;
        parentLoanName = loanNode.name;
      }
    }
  }

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-[#282e33] border-l border-[#3d4b5c] flex flex-col shadow-2xl z-10">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-[#3d4b5c] flex-shrink-0">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mb-1">{att.category}</p>
          <h3 className="text-sm font-semibold text-[#e8ecf0] leading-snug break-words">{att.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mock preview */}
        <MockPreview att={att} />

        {/* Status */}
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[att.status] ?? ''}`}>
            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
          </span>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <MetaRow label="File Type"  value={att.fileType.toUpperCase()} />
          <MetaRow label="Size"       value={fmtSize(att.sizeBytes)} />
          <MetaRow label="Uploaded"   value={fmtDate(att.uploadedAt)} />
          <MetaRow label="Uploaded By" value={att.uploadedById ?? '—'} />
        </div>

        {/* Parent loan */}
        {parentLoanId && parentLoanName && (
          <div className="pt-2 border-t border-[#3d4b5c]">
            <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mb-1.5">Loan</p>
            <p className="text-sm text-[#b6c2cf] leading-snug mb-2">{parentLoanName}</p>
            <button
              onClick={() => onViewInBoard(parentLoanId!)}
              className="flex items-center gap-1.5 text-xs text-[#579dff] hover:text-[#82b4ff] transition-colors"
            >
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <rect x="1" y="3" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 5.5h10" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 3V2M8 3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              View in Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
