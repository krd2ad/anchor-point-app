import { useState } from 'react';
import type { FileTreeNode, FolderCounts } from '../../lib/fileTree';
import { FOLDER_HIERARCHY, CATEGORY_LABEL } from '../../data/loanFolderCategories';

interface FileTreeProps {
  nodes: FileTreeNode[];
  selectedId: string | null;
  onSelect: (node: FileTreeNode) => void;
}

function StatusChip({ counts }: { counts: FolderCounts }) {
  if (counts.total === 0) {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3d4b5c] text-[#4d5f6e]">
        0 files
      </span>
    );
  }
  const allVerified = counts.verified === counts.total && counts.total > 0;
  const anyRequested = counts.requested > 0;
  const color = allVerified
    ? 'bg-green-500/20 text-green-400'
    : anyRequested
    ? 'bg-yellow-500/20 text-yellow-400'
    : 'bg-blue-500/20 text-blue-400';

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}>
      {counts.verified}/{counts.total}
    </span>
  );
}

function FileTypeIcon({ fileType }: { fileType: string }) {
  switch (fileType) {
    case 'jpg':
    case 'png':
      return (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-green-400 flex-shrink-0">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.25" />
          <path d="M1.5 10l3.5-3.5 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5.5" cy="6" r="1.25" fill="currentColor" />
        </svg>
      );
    case 'docx':
      return (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-blue-400 flex-shrink-0">
          <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'xlsx':
      return (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-green-400 flex-shrink-0">
          <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M5 8l2.5 3M7.5 8L5 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    default: // pdf and other
      return (
        <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-red-400 flex-shrink-0">
          <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M5 8.5h3.5a1 1 0 010 2H5v-2z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
  }
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#579dff] flex-shrink-0">
      {open ? (
        <path
          d="M1 4a1 1 0 011-1h4l1.5 1.5H14a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"
          fill="currentColor"
          fillOpacity="0.25"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      ) : (
        <path
          d="M1 4a1 1 0 011-1h4l1.5 1.5H14a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      )}
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={`w-3 h-3 flex-shrink-0 text-[#7a8899] transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function renderLoanChildren(
  children: FileTreeNode[],
  selectedId: string | null,
  onSelect: (n: FileTreeNode) => void,
  depth: number,
) {
  const indent = depth * 12;
  const rows: React.ReactNode[] = [];

  for (const group of FOLDER_HIERARCHY) {
    const groupNodes = group.categories
      .map(def => children.find(c => c.kind === 'category' && c.category === def.category))
      .filter((c): c is FileTreeNode => c !== undefined);

    if (groupNodes.length === 0) continue;

    // Stage header — non-interactive label
    rows.push(
      <div
        key={`header-${group.stageLabel}`}
        className="text-[9px] uppercase tracking-widest font-semibold text-[#454f59] mt-2 mb-0.5"
        style={{ paddingLeft: 8 + indent }}
      >
        {group.stageLabel}
      </div>
    );

    for (const child of groupNodes) {
      const displayName = child.kind === 'category'
        ? (CATEGORY_LABEL[child.category] ?? child.name)
        : child.name;
      rows.push(
        <TreeNodeRow
          key={child.id}
          node={{ ...child, name: displayName }}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={depth}
        />
      );
    }
  }

  return rows;
}

interface TreeNodeRowProps {
  node: FileTreeNode;
  selectedId: string | null;
  onSelect: (node: FileTreeNode) => void;
  depth?: number;
}

function TreeNodeRow({ node, selectedId, onSelect, depth = 0 }: TreeNodeRowProps) {
  const [open, setOpen] = useState(depth === 0); // loan nodes default open

  const isSelected = selectedId === node.id;
  const indent = depth * 12;

  if (node.kind === 'file') {
    const att = node.attachment;
    return (
      <button
        onClick={() => onSelect(node)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
          isSelected
            ? 'bg-[#579dff]/20 text-[#e8ecf0]'
            : 'text-[#b6c2cf] hover:bg-[#282e33] hover:text-[#e8ecf0]'
        }`}
        style={{ paddingLeft: 12 + indent }}
      >
        <FileTypeIcon fileType={att.fileType} />
        <span className="flex-1 truncate text-xs">{att.name}</span>
        <StatusBadge status={att.status} />
      </button>
    );
  }

  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          setOpen((o) => !o);
          onSelect(node);
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
          isSelected
            ? 'bg-[#579dff]/20 text-[#e8ecf0]'
            : node.kind === 'loan'
            ? 'text-[#e8ecf0] hover:bg-[#282e33]'
            : 'text-[#b6c2cf] hover:bg-[#282e33] hover:text-[#e8ecf0]'
        }`}
        style={{ paddingLeft: 8 + indent }}
      >
        {hasChildren ? <Chevron open={open} /> : <span className="w-3 flex-shrink-0" />}
        <FolderIcon open={open} />
        <span className="flex-1 truncate text-xs font-medium">
          {node.name}
        </span>
        {node.kind === 'loan' && node.counts.total > 0 && (
          <span className={`text-[10px] font-mono flex-shrink-0 ${
            node.counts.verified === node.counts.total ? 'text-[#4bce97]' :
            node.counts.requested > 0 ? 'text-[#f5cd47]' : 'text-[#6cc3e0]'
          }`}>
            {Math.round(node.counts.verified / node.counts.total * 100)}%
          </span>
        )}
        {'counts' in node && node.kind !== 'loan' && <StatusChip counts={node.counts} />}
      </button>

      {open && hasChildren && (
        <div>
          {node.kind === 'loan'
            ? renderLoanChildren(node.children, selectedId, onSelect, depth + 1)
            : node.children.map((child) => (
                <TreeNodeRow
                  key={child.id}
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              ))
          }
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    not_yet_requested: 'bg-[#22272b] text-[#454f59]',
    requested: 'bg-yellow-500/20 text-yellow-400',
    received:  'bg-blue-500/20 text-blue-400',
    verified:  'bg-green-500/20 text-green-400',
    waived:    'bg-[#3d4b5c] text-[#7a8899]',
  };
  const labels: Record<string, string> = {
    not_yet_requested: 'Not Requested',
    verified:  'Verified',
    received:  'Received',
    requested: 'Requested',
    waived:    'Waived',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded flex-shrink-0 ${styles[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}

export function FileTree({ nodes, selectedId, onSelect }: FileTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="p-4 text-sm text-[#7a8899] italic">No matching files.</div>
    );
  }

  return (
    <div className="py-2">
      {nodes.map((node) => (
        <TreeNodeRow
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}
