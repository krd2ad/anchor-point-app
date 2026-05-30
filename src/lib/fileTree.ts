import type { Loan, Attachment } from '../types';
import { LOAN_FOLDER_CATEGORIES } from '../data/loanFolderCategories';
import { STAGES } from '../data/stages';

// ─── Node types ───────────────────────────────────────────────────────────────

export interface FolderCounts {
  total: number;
  verified: number;
  received: number;
  requested: number;
  waived: number;
}

export type FileTreeNode =
  | {
      kind: 'loan';
      id: string;
      name: string;
      loanId: string;
      stageId: string;
      children: FileTreeNode[];
      counts: FolderCounts;
    }
  | {
      kind: 'category';
      id: string;
      name: string;
      category: string;
      children: FileTreeNode[];
      counts: FolderCounts;
    }
  | {
      kind: 'file';
      id: string;
      name: string;
      attachment: Attachment;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function zeroCounts(): FolderCounts {
  return { total: 0, verified: 0, received: 0, requested: 0, waived: 0 };
}

function addCounts(a: FolderCounts, b: FolderCounts): FolderCounts {
  return {
    total:     a.total     + b.total,
    verified:  a.verified  + b.verified,
    received:  a.received  + b.received,
    requested: a.requested + b.requested,
    waived:    a.waived    + b.waived,
  };
}

function countsForAttachments(attachments: Attachment[]): FolderCounts {
  const counts = zeroCounts();
  for (const att of attachments) {
    counts.total++;
    if (att.status === 'verified')  counts.verified++;
    if (att.status === 'received')  counts.received++;
    if (att.status === 'requested') counts.requested++;
    if (att.status === 'waived')    counts.waived++;
  }
  return counts;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export interface BuildFileTreeOptions {
  showEmptyCategories?: boolean;
}

/**
 * Build a three-level file tree: loan → category → file.
 * Loans are sorted by stage order then displayLabel; categories follow LOAN_FOLDER_CATEGORIES order.
 * @param loans - all loans to include as top-level nodes
 * @param attachments - all attachments, grouped by loanId and category
 * @param options - set showEmptyCategories=false to omit category nodes with no files (default: true)
 */
export function buildFileTree(
  loans: Loan[],
  attachments: Attachment[],
  options?: BuildFileTreeOptions,
): FileTreeNode[] {
  const showEmpty = options?.showEmptyCategories ?? true;

  // Build a stage order lookup for sorting
  const stageOrder = new Map<string, number>();
  for (const stage of STAGES) {
    stageOrder.set(stage.id, stage.order);
  }

  // Group attachments by loanId
  const attachmentsByLoan = new Map<string, Attachment[]>();
  for (const att of attachments) {
    const list = attachmentsByLoan.get(att.loanId) ?? [];
    list.push(att);
    attachmentsByLoan.set(att.loanId, list);
  }

  // Sort loans by stage order, then by displayLabel
  const sortedLoans = [...loans].sort((a, b) => {
    const orderDiff = (stageOrder.get(a.stageId) ?? 99) - (stageOrder.get(b.stageId) ?? 99);
    if (orderDiff !== 0) return orderDiff;
    return a.displayLabel.localeCompare(b.displayLabel);
  });

  const tree: FileTreeNode[] = [];

  for (const loan of sortedLoans) {
    const loanAttachments = attachmentsByLoan.get(loan.id) ?? [];

    // Group attachments by category
    const byCategory = new Map<string, Attachment[]>();
    for (const att of loanAttachments) {
      const list = byCategory.get(att.category) ?? [];
      list.push(att);
      byCategory.set(att.category, list);
    }

    const categoryNodes: FileTreeNode[] = [];

    for (const category of LOAN_FOLDER_CATEGORIES) {
      const catAttachments = byCategory.get(category) ?? [];

      if (!showEmpty && catAttachments.length === 0) continue;

      // Sort files by name
      const sortedFiles = [...catAttachments].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const fileNodes: FileTreeNode[] = sortedFiles.map(att => ({
        kind: 'file' as const,
        id:   `file-${att.id}`,
        name: att.name,
        attachment: att,
      }));

      const catCounts = countsForAttachments(catAttachments);

      const categoryNode: FileTreeNode = {
        kind:     'category',
        id:       `cat-${loan.id}-${category}`,
        name:     category,
        category,
        children: fileNodes,
        counts:   catCounts,
      };

      categoryNodes.push(categoryNode);
    }

    // Aggregate loan counts from category counts
    const loanCounts = categoryNodes.reduce<FolderCounts>(
      (acc, node) => (node.kind === 'category' ? addCounts(acc, node.counts) : acc),
      zeroCounts(),
    );

    const loanNode: FileTreeNode = {
      kind:     'loan',
      id:       `loan-node-${loan.id}`,
      name:     loan.displayLabel,
      loanId:   loan.id,
      stageId:  loan.stageId,
      children: categoryNodes,
      counts:   loanCounts,
    };

    tree.push(loanNode);
  }

  return tree;
}
