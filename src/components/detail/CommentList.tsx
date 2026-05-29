import type { Comment } from '../../types';
import { STAGES } from '../../data/stages';

interface CommentListProps {
  comments: Comment[];
  onResolve: (id: string) => void;
  onUnresolve: (id: string) => void;
}

const AVATAR_COLORS = [
  'bg-[#579dff]',
  'bg-[#9f8fef]',
  'bg-[#4bce97]',
  'bg-[#f5cd47]',
  'bg-[#f87168]',
  'bg-[#6cc3e0]',
];

function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(authorId: string): string {
  // Derive readable initials from the id — take first 2 uppercase chars
  const upper = authorId.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return upper.slice(0, 2) || 'U?';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function CommentList({ comments, onResolve, onUnresolve }: CommentListProps) {
  const sorted = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-[#7a8899] italic">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {sorted.map((c) => {
        const stage = STAGES.find((s) => s.id === c.stageId);
        const color = hashColor(c.authorId);
        return (
          <div
            key={c.id}
            className={`flex gap-2 ${c.resolved ? 'opacity-60' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full ${color} flex items-center justify-center text-[10px] font-bold text-white`}
            >
              {initials(c.authorId)}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {stage && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: stage.color + '33',
                      color: stage.color,
                      border: `1px solid ${stage.color}55`,
                    }}
                  >
                    {stage.name}
                  </span>
                )}
                <span className="text-[10px] text-[#7a8899]">{timeAgo(c.createdAt)}</span>
              </div>

              <p className="text-sm text-[#b6c2cf] leading-snug break-words">{c.body}</p>

              <div className="mt-1.5">
                {c.resolved ? (
                  <button
                    onClick={() => onUnresolve(c.id)}
                    className="text-[11px] text-[#7a8899] hover:text-[#b6c2cf] transition-colors"
                  >
                    Unresolve
                  </button>
                ) : (
                  <button
                    onClick={() => onResolve(c.id)}
                    className="text-[11px] text-[#4bce97] hover:text-green-300 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
