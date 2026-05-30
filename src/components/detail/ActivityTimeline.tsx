import { useState } from 'react';
import type { Comment, LoanStepStatus } from '../../types';
import { STAGE_STEPS } from '../../data/stageSteps';
import { STAGES } from '../../data/stages';

interface ActivityTimelineProps {
  comments: Comment[];
  stepStatuses: LoanStepStatus[];
}

type ActivityEvent =
  | { kind: 'comment'; id: string; body: string; authorId: string; stageId: string; resolved: boolean; ts: string }
  | { kind: 'step'; id: string; stepId: string; ts: string };

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(authorId: string): string {
  return authorId.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) || 'U';
}

const AVATAR_COLORS = ['#579dff', '#9f8fef', '#4bce97', '#f5cd47', '#f87168', '#6cc3e0'];
function avatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function ActivityTimeline({ comments, stepStatuses }: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  const stepMap = new Map(STAGE_STEPS.map(s => [s.id, s]));
  const stageMap = new Map(STAGES.map(s => [s.id, s]));

  // Build events
  const events: ActivityEvent[] = [];

  for (const c of comments) {
    events.push({ kind: 'comment', id: c.id, body: c.body, authorId: c.authorId, stageId: c.stageId, resolved: c.resolved, ts: c.createdAt });
  }

  for (const ss of stepStatuses) {
    if (ss.status === 'done' && ss.completedAt) {
      events.push({ kind: 'step', id: ss.id, stepId: ss.stepId, ts: ss.completedAt });
    }
  }

  events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const MAX_DEFAULT = 8;
  const displayed = showAll ? events : events.slice(0, MAX_DEFAULT);
  const hasMore = events.length > MAX_DEFAULT;

  if (events.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf] mb-2">Activity</h3>
        <p className="text-sm text-[#7a8899] italic">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b6c2cf] mb-3">Activity</h3>

      <div className="relative ml-2">
        {/* Vertical timeline line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-[#3d4b5c]" />

        <ul className="space-y-3 pl-5">
          {displayed.map(evt => (
            <li key={evt.id} className="relative">
              {/* Dot */}
              <span
                className="absolute -left-[21px] top-1 w-2 h-2 rounded-full border-2 border-[#282e33]"
                style={{ backgroundColor: evt.kind === 'comment' ? '#579dff' : '#4bce97' }}
              />

              {evt.kind === 'comment' ? (
                <div className={evt.resolved ? 'opacity-60' : ''}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarColor(evt.authorId) }}
                    >
                      {initials(evt.authorId)}
                    </span>
                    <span className="text-[10px] text-[#7a8899]">commented</span>
                    {evt.stageId && stageMap.get(evt.stageId) && (
                      <span
                        className="text-[9px] px-1 py-0.5 rounded"
                        style={{
                          color: stageMap.get(evt.stageId)!.color,
                          backgroundColor: stageMap.get(evt.stageId)!.color + '20',
                        }}
                      >
                        {stageMap.get(evt.stageId)!.name}
                      </span>
                    )}
                    <span className="text-[10px] text-[#4d5f6e] ml-auto flex-shrink-0">{fmtDate(evt.ts)}</span>
                  </div>
                  <p className="text-xs text-[#b6c2cf] leading-snug line-clamp-2">{evt.body}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-[#4bce97] flex-shrink-0">
                      <circle cx="6" cy="6" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1"/>
                      <path d="M3.5 6l1.75 1.75L8.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs text-[#7a8899] leading-snug flex-1 min-w-0">
                      <span className="text-[#b6c2cf]">{stepMap.get(evt.stepId)?.label ?? evt.stepId}</span>
                      <span className="text-[#5d6f7e]"> marked complete</span>
                    </span>
                    <span className="text-[10px] text-[#4d5f6e] flex-shrink-0">{fmtDate(evt.ts)}</span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="mt-3 ml-7 text-xs text-[#579dff] hover:text-[#82b4ff] transition-colors"
        >
          {showAll ? 'Show less' : `Show ${events.length - MAX_DEFAULT} more`}
        </button>
      )}
    </div>
  );
}
