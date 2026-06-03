import { useState } from 'react';
import type { FileTreeNode } from '../../lib/fileTree';
import type { AttachmentCategory } from '../../types';
import { useToast } from '../shared/Toast';
import { FOLDER_HIERARCHY, CATEGORY_EXPECTED_DOCS, CATEGORY_LABEL } from '../../data/loanFolderCategories';

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

const STATUS_STYLES: Record<string, string> = {
  verified:  'bg-green-500/20 text-green-400',
  received:  'bg-blue-500/20 text-blue-400',
  requested: 'bg-yellow-500/20 text-yellow-400',
  waived:    'bg-[#3d4b5c] text-[#7a8899]',
};

function FileTypeIcon({ fileType }: { fileType: string }) {
  const isImage = fileType === 'jpg' || fileType === 'png';
  const isDoc   = fileType === 'docx';
  const isSheet = fileType === 'xlsx';
  const color = isImage ? 'text-green-400' : isDoc ? 'text-blue-400' : isSheet ? 'text-green-400' : 'text-red-400';
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`w-8 h-8 ${color} flex-shrink-0`}>
      {isImage ? (
        <>
          <rect x="1.5" y="2.5" width="13" height="11" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M1.5 10l3.5-3.5 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="5.5" cy="6" r="1.25" fill="currentColor" />
        </>
      ) : (
        <>
          <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

interface FolderContentsProps {
  node: FileTreeNode | null;
  tree: FileTreeNode[];
  onFileSelect: (node: FileTreeNode) => void;
  onAddMock: (loanId: string, category: string) => void;
}

function getLoanIdForNode(node: FileTreeNode, tree: FileTreeNode[]): string | null {
  if (node.kind === 'loan') return node.loanId;
  for (const loanNode of tree) {
    if (loanNode.kind !== 'loan') continue;
    for (const child of loanNode.children) {
      if (child.id === node.id) return loanNode.loanId;
    }
  }
  return null;
}

function getStageLabel(category: AttachmentCategory): string {
  for (const group of FOLDER_HIERARCHY) {
    if (group.categories.some(c => c.category === category)) return group.stageLabel;
  }
  return '';
}

function getBreadcrumb(node: FileTreeNode, tree: FileTreeNode[]): string[] {
  if (node.kind === 'loan') return ['Loans', node.name];
  for (const loanNode of tree) {
    if (loanNode.kind !== 'loan') continue;
    for (const child of loanNode.children) {
      if (child.id === node.id && child.kind === 'category') {
        const stageLabel = getStageLabel(child.category);
        const catLabel = CATEGORY_LABEL[child.category] ?? child.name;
        // Only show the extra stage crumb when the category label differs from the stage label
        if (stageLabel && catLabel !== stageLabel) {
          return ['Loans', loanNode.name, stageLabel, catLabel];
        }
        return ['Loans', loanNode.name, catLabel];
      }
    }
  }
  return ['Loans', node.name];
}

export function FolderContents({ node, tree, onFileSelect, onAddMock }: FolderContentsProps) {
  const { showToast } = useToast();
  // Track which category folder row is being dragged over (loan node view)
  const [dragOverCategory, setDragOverCategory] = useState<AttachmentCategory | null>(null);
  // Track whether the category content drop zone is active
  const [isDragOverContent, setIsDragOverContent] = useState(false);

  if (!node) {
    return (
      <div className="flex items-center justify-center h-full text-[#7a8899] text-sm italic p-8">
        Select a folder to view its contents.
      </div>
    );
  }

  if (node.kind === 'file') return null;

  const breadcrumb = getBreadcrumb(node, tree);
  const children   = node.children;
  const loanId     = getLoanIdForNode(node, tree);
  const category   = node.kind === 'category' ? node.category : null;
  const hints      = category ? (CATEGORY_EXPECTED_DOCS[category] ?? []) : [];

  // ── Drag helpers ──────────────────────────────────────────────────────────

  function handleRowDragOver(e: React.DragEvent, cat: AttachmentCategory) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverCategory(cat);
  }

  function handleRowDragLeave() {
    setDragOverCategory(null);
  }

  function handleRowDrop(e: React.DragEvent, targetLoanId: string, cat: AttachmentCategory) {
    e.preventDefault();
    setDragOverCategory(null);
    const filename = e.dataTransfer.files[0]?.name ?? 'Dropped Document';
    onAddMock(targetLoanId, cat);
    showToast(`File added (mock): ${filename}`, 'success');
  }

  function handleContentDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverContent(true);
  }

  function handleContentDragLeave(e: React.DragEvent) {
    // Only clear if leaving the drop zone entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverContent(false);
    }
  }

  function handleContentDrop(e: React.DragEvent, targetLoanId: string, cat: AttachmentCategory) {
    e.preventDefault();
    setIsDragOverContent(false);
    const filename = e.dataTransfer.files[0]?.name ?? 'Dropped Document';
    onAddMock(targetLoanId, cat);
    showToast(`File added (mock): ${filename}`, 'success');
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#7a8899] mb-4">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            <span className={i === breadcrumb.length - 1 ? 'text-[#e8ecf0] font-medium' : ''}>{crumb}</span>
          </span>
        ))}
      </div>

      {/* File list */}
      {children.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {/* Category sub-folders in loan view — grouped under stage headers */}
          {node.kind === 'loan' && (
            <div className="space-y-4">
              {FOLDER_HIERARCHY.map(group => {
                const groupCategories = group.categories
                  .map(def => children.find(
                    c => c.kind === 'category' && c.category === def.category
                  ))
                  .filter((c): c is FileTreeNode & { kind: 'category' } => c?.kind === 'category');

                if (groupCategories.length === 0) return null;

                return (
                  <div key={group.stageLabel}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-[#5d6f7e] mb-1.5 px-0.5">
                      {group.stageLabel}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {groupCategories.map(child => {
                        const allVerified = child.counts.verified === child.counts.total && child.counts.total > 0;
                        const anyRequested = child.counts.requested > 0;
                        const dotColor = child.counts.total === 0 ? '#3d4b5c' : allVerified ? '#4bce97' : anyRequested ? '#f5cd47' : '#6cc3e0';
                        const isOver = dragOverCategory === child.category;
                        const displayLabel = CATEGORY_LABEL[child.category] ?? child.name;
                        return (
                          <button
                            key={child.id}
                            onClick={() => onFileSelect(child)}
                            onDragOver={(e) => handleRowDragOver(e, child.category)}
                            onDragLeave={handleRowDragLeave}
                            onDrop={loanId ? (e) => handleRowDrop(e, loanId, child.category) : undefined}
                            className={`flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${
                              isOver
                                ? 'bg-[#579dff]/5 border-dashed border-[#579dff]/60'
                                : 'bg-[#282e33] hover:bg-[#2d3748] border-[#3d4b5c]'
                            }`}
                          >
                            <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5 text-[#579dff] flex-shrink-0">
                              <path d="M1 4a1 1 0 011-1h4l1.5 1.5H14a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.1" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#e8ecf0] truncate">{displayLabel}</p>
                              <p className="text-xs text-[#7a8899]">{child.counts.total} file{child.counts.total !== 1 ? 's' : ''}</p>
                            </div>
                            {isOver && (
                              <span className="text-xs text-[#579dff] flex-shrink-0 font-medium">Drop to add</span>
                            )}
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                            <span className="text-xs text-[#7a8899] flex-shrink-0">{child.counts.verified}/{child.counts.total}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Files in category view */}
          {node.kind === 'category' && (
            <div
              className={`relative rounded-md transition-colors ${
                isDragOverContent
                  ? 'border-2 border-dashed border-[#579dff]/60 bg-[#579dff]/5'
                  : 'border-2 border-transparent'
              }`}
              onDragOver={handleContentDragOver}
              onDragLeave={handleContentDragLeave}
              onDrop={loanId && category ? (e) => handleContentDrop(e, loanId, category) : undefined}
            >
              {isDragOverContent && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="flex items-center gap-2 text-[#579dff] text-sm font-medium">
                    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Drop to add file
                  </div>
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-[#7a8899] border-b border-[#3d4b5c]">
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Size</th>
                    <th className="text-left pb-2 font-medium">Uploaded</th>
                    <th className="text-left pb-2 font-medium">By</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map(child => {
                    if (child.kind !== 'file') return null;
                    const att = child.attachment;
                    return (
                      <tr
                        key={child.id}
                        onClick={() => onFileSelect(child)}
                        className="border-b border-[#2d3748] hover:bg-[#282e33] cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <FileTypeIcon fileType={att.fileType} />
                            <div className="min-w-0">
                              <p className="text-[#e8ecf0] truncate font-medium text-xs">{att.name}</p>
                              <p className="text-[#7a8899] text-[10px] uppercase">{att.fileType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_STYLES[att.status] ?? ''}`}>
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-[#7a8899] whitespace-nowrap">{fmtSize(att.sizeBytes)}</td>
                        <td className="py-2.5 pr-4 text-xs text-[#7a8899] whitespace-nowrap">{fmtDate(att.uploadedAt)}</td>
                        <td className="py-2.5 text-xs text-[#7a8899]">{att.uploadedById ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
          <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 text-[#3d4b5c]">
            <path d="M4 10a2 2 0 012-2h10l3 3h15a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V10z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div>
            <p className="text-sm text-[#7a8899] italic mb-2">No documents yet</p>
            {hints.length > 0 && (
              <div className="text-xs text-[#4d5f6e] space-y-0.5 max-w-xs">
                <p className="text-[#5d6f7e] mb-1">Expected in this folder:</p>
                {hints.map(h => <p key={h}>· {h}</p>)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add mock button */}
      {loanId && category && (
        <div className="mt-4 pt-4 border-t border-[#3d4b5c]">
          <button
            onClick={() => {
              onAddMock(loanId, category);
            }}
            className="flex items-center gap-2 text-xs text-[#7a8899] hover:text-[#b6c2cf] border border-dashed border-[#3d4b5c] hover:border-[#579dff]/40 rounded-md px-3 py-2 transition-colors w-full justify-center"
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            Add file (mock demo)
          </button>
        </div>
      )}
    </div>
  );
}
