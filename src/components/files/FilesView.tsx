import { useState } from 'react';
import { nanoid } from 'nanoid';
import { useFileTree } from '../../context/LoanServiceProvider';
import type { FileTreeNode } from '../../lib/fileTree';
import { FilesHeader } from './FilesHeader';
import { FileTree } from './FileTree';
import { FolderContents } from './FolderContents';
import { FileMetaPanel } from './FileMetaPanel';

interface FilesViewProps {
  onSwitchToBoard: (loanId?: string) => void;
}

export function FilesView({ onSwitchToBoard }: FilesViewProps) {
  const fileTreeState = useFileTree();
  const { tree, loading, showEmptyCategories, setShowEmptyCategories, addMockAttachment, updateAttachmentStatus } = fileTreeState;

  const [selectedNode, setSelectedNode] = useState<FileTreeNode | null>(null);
  const [fileNode, setFileNode] = useState<FileTreeNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="animate-spin h-8 w-8 border-4 border-[#3d4b5c] border-t-[#579dff] rounded-full" />
      </div>
    );
  }

  function handleNodeSelect(node: FileTreeNode) {
    if (node.kind === 'file') {
      setFileNode(node);
    } else {
      setSelectedNode(node);
      setFileNode(null);
    }
  }

  function handleFileSelect(node: FileTreeNode) {
    if (node.kind === 'file') {
      setFileNode(node);
    }
  }

  function handleCloseFileMeta() {
    setFileNode(null);
  }

  function handleViewInBoard(loanId: string) {
    onSwitchToBoard(loanId);
  }

  // Filter tree by search query
  function filterTree(nodes: FileTreeNode[], query: string): FileTreeNode[] {
    if (!query.trim()) return nodes;
    const q = query.toLowerCase();

    return nodes.flatMap((node): FileTreeNode[] => {
      if (node.kind === 'file') {
        const att = node.attachment;
        const matches =
          att.name.toLowerCase().includes(q) ||
          att.category.toLowerCase().includes(q) ||
          att.status.toLowerCase().includes(q);
        return matches ? [node] : [];
      }
      if (node.kind === 'category') {
        const filteredChildren = filterTree(node.children, query);
        if (filteredChildren.length === 0) return [];
        return [{ ...node, children: filteredChildren }];
      }
      if (node.kind === 'loan') {
        const filteredChildren = filterTree(node.children, query);
        const nameMatches = node.name.toLowerCase().includes(q);
        if (filteredChildren.length === 0 && !nameMatches) return [];
        return [{ ...node, children: filteredChildren }];
      }
      return [];
    });
  }

  const displayTree = filterTree(tree, searchQuery);

  // Global stats from the full tree
  const totalStats = tree.reduce(
    (acc, loanNode) => {
      if (loanNode.kind === 'loan') {
        acc.total     += loanNode.counts.total;
        acc.verified  += loanNode.counts.verified;
        acc.received  += loanNode.counts.received;
        acc.requested += loanNode.counts.requested;
      }
      return acc;
    },
    { total: 0, verified: 0, received: 0, requested: 0 },
  );

  // TODO: use to resolve loanId when selectedNode is a category node (e.g. for "add mock" or breadcrumb nav)
  // function getLoanIdFromNode(node: FileTreeNode | null): string | null {
  //   if (!node) return null;
  //   if (node.kind === 'loan') return node.loanId;
  //   if (node.kind === 'category') {
  //     for (const loanNode of tree) {
  //       if (loanNode.kind === 'loan') {
  //         for (const child of loanNode.children) {
  //           if (child.id === node.id) return loanNode.loanId;
  //         }
  //       }
  //     }
  //   }
  //   return null;
  // }

  function handleAddMock(loanId: string, category: string) {
    const newAtt = {
      id: nanoid(),
      loanId,
      name: `[Mock] New Document – ${category}`,
      kind: 'Other' as const,
      status: 'received' as const,
      category: category as import('../../types').AttachmentCategory,
      fileType: 'pdf' as const,
      sizeBytes: 102400,
      uploadedAt: new Date().toISOString(),
      uploadedById: 'user-1',
    };
    addMockAttachment(newAtt);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <FilesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showEmptyCategories={showEmptyCategories}
        onToggleEmpty={setShowEmptyCategories}
        stats={totalStats}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane — tree */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-[#3d4b5c] bg-[#1d2125]">
          <FileTree
            nodes={displayTree}
            selectedId={selectedNode?.id ?? fileNode?.id ?? null}
            onSelect={handleNodeSelect}
          />
        </div>

        {/* Right pane — folder contents */}
        <div className="flex-1 overflow-y-auto bg-[#1d2125] relative">
          <FolderContents
            node={selectedNode}
            tree={tree}
            onFileSelect={handleFileSelect}
            onAddMock={handleAddMock}
          />

          {/* File meta panel slide-over */}
          {fileNode && fileNode.kind === 'file' && (
            <FileMetaPanel
              node={fileNode}
              tree={tree}
              onClose={handleCloseFileMeta}
              onViewInBoard={handleViewInBoard}
              onStatusChange={async (attachment, status) => {
                const updated = await updateAttachmentStatus(attachment, status);
                setFileNode(prev =>
                  prev?.kind === 'file' ? { ...prev, attachment: updated } : prev
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
