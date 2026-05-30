import { useEffect, useState, useCallback } from 'react';
import type {
  ProcessStep, LoanStepStatus, StepStatus, UnderwritingScorecard, ExternalParty,
} from '../../types';
import { STAGES } from '../../data/stages';
import { EXTERNAL_PARTIES } from '../../data/externalParties';
import { useLoanService } from '../../context/LoanServiceProvider';
import { useToast } from '../shared/Toast';
import { ActionChip, OwnerChip } from './stepMeta';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextStatus(s: StepStatus): StepStatus {
  return s === 'not_done' ? 'done' : s === 'done' ? 'na' : 'not_done';
}

function StatusIcon({ status, critical }: { status: StepStatus; critical?: boolean }) {
  if (status === 'done') {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0">
        <circle cx="10" cy="10" r="9" fill="#4bce97" />
        <path d="M6 10l3 3 5-5" stroke="#1d2125" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'na') {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0">
        <circle cx="10" cy="10" r="9" fill="#3d4b5c" />
        <line x1="7" y1="10" x2="13" y2="10" stroke="#7a8899" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5 flex-shrink-0">
      <circle cx="10" cy="10" r="9" stroke={critical ? '#f87168' : '#3d4b5c'} strokeWidth={critical ? 2.5 : 2} />
      {critical && <path d="M10 6v5M10 13h.01" stroke="#f87168" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

// ─── Party contact card ────────────────────────────────────────────────────────

function PartyCard({ party }: { party: ExternalParty }) {
  return (
    <div className="mt-1.5 flex items-start gap-2 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-2 text-xs">
      <span className="text-[#f5cd47] font-medium whitespace-nowrap">Waiting on</span>
      <div className="min-w-0">
        <p className="text-[#e8ecf0] font-medium truncate">{party.name}</p>
        {(party.phone || party.email) && (
          <p className="text-[#7a8899] truncate">{[party.phone, party.email].filter(Boolean).join(' · ')}</p>
        )}
      </div>
    </div>
  );
}

// ─── Template preview / send modal ────────────────────────────────────────────

interface TemplatePreviewModalProps {
  subject: string;
  body: string;
  channel: 'email' | 'text';
  stepLabel: string;
  onClose: () => void;
  onSent: () => void; // marks step done + logs comment
}

function TemplatePreviewModal({ subject, body, channel, stepLabel, onClose, onSent }: TemplatePreviewModalProps) {
  const [sent, setSent] = useState(false);

  function handleSend() {
    setSent(true);
    onSent();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#22272b] border border-[#3d4b5c] rounded-xl shadow-2xl w-[520px] max-h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3d4b5c] flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[10px] text-[#7a8899] uppercase tracking-wider">
                {channel === 'email' ? 'Email Preview' : 'Text Message Preview'}
              </p>
              {channel === 'email' && subject && (
                <span className="text-[10px] bg-[#579dff]/20 text-[#579dff] px-1.5 py-0.5 rounded">Email</span>
              )}
              {channel === 'text' && (
                <span className="text-[10px] bg-[#6cc3e0]/20 text-[#6cc3e0] px-1.5 py-0.5 rounded">Text</span>
              )}
            </div>
            {subject && <p className="text-sm font-semibold text-[#e8ecf0] truncate">{subject}</p>}
            {!subject && <p className="text-sm text-[#b6c2cf]">{stepLabel}</p>}
          </div>
          <button onClick={onClose} className="ml-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-[#7a8899] hover:text-[#e8ecf0] hover:bg-[#3d4b5c] transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {body ? (
            <pre className="text-sm text-[#b6c2cf] whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
          ) : (
            <p className="text-sm text-[#f5cd47] italic">Template body not yet defined — confirm wording with team.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-[#3d4b5c] flex items-center justify-between gap-3">
          {sent ? (
            <div className="flex items-center gap-2 text-sm text-[#4bce97]">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><circle cx="8" cy="8" r="7" fill="#4bce97"/><path d="M5 8l2.5 2.5L11 6" stroke="#1d2125" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Marked as sent — step complete
            </div>
          ) : (
            <>
              <p className="text-xs text-[#7a8899] flex-1">
                Review the pre-filled message above, then mark as sent to complete this step.
              </p>
              <button
                onClick={handleSend}
                disabled={!body}
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium text-white bg-[#579dff] hover:bg-[#4a8fe8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><path d="M2 8l12-5-5 12-2-4.5L2 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                Mark as Sent
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Scorecard widget ─────────────────────────────────────────────────────────

function ScorecardWidget({ sc }: { sc: UnderwritingScorecard }) {
  const decisionColor =
    sc.decision === 'Approved' ? '#4bce97' :
    sc.decision === 'Denied'   ? '#f87168' :
    sc.decision === 'Suspended'? '#f5cd47' : '#7a8899';

  return (
    <div className="mt-2 bg-[#1d2125] border border-[#3d4b5c] rounded-md p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">Underwriting Scorecard</span>
        {sc.decision && (
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: decisionColor, border: `1px solid ${decisionColor}55`, backgroundColor: decisionColor + '18' }}>
            {sc.decision}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {sc.rules.map(r => (
          <div key={r.key} className="flex items-start gap-1.5">
            <span className={`mt-0.5 text-[10px] font-bold flex-shrink-0 ${r.result === 'pass' ? 'text-[#4bce97]' : r.result === 'fail' ? 'text-[#f87168]' : 'text-[#7a8899]'}`}>
              {r.result === 'pass' ? '✓' : r.result === 'fail' ? '✗' : '—'}
            </span>
            <div className="min-w-0">
              <p className={`text-[10px] font-medium ${r.result === 'fail' ? 'text-[#f87168]' : 'text-[#b6c2cf]'}`}>{r.label}</p>
              {r.detail && <p className="text-[10px] text-[#7a8899] leading-tight">{r.detail}</p>}
            </div>
          </div>
        ))}
      </div>
      {sc.deviations.length > 0 && (
        <div className="text-[10px] text-[#f87168] border-t border-[#3d4b5c] pt-1.5">
          Deviations: {sc.deviations.join(', ')}
        </div>
      )}
    </div>
  );
}

// ─── Individual step row ───────────────────────────────────────────────────────

interface StepRowProps {
  step: ProcessStep;
  status: StepStatus;
  loanId: string;
  stageId: string;
  onToggle: () => void;
  onMarkSent: (stepId: string) => void;
  scorecard: UnderwritingScorecard | null;
}

function StepRow({ step, status, loanId, stageId, onToggle, onMarkSent, scorecard }: StepRowProps) {
  const service = useLoanService();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);

  const isCritical = step.severity === 'critical';
  const isAwait = step.actionType === 'await_third_party';
  const hasTemplate = !!step.templateId;
  const showScorecard = !!step.ruleKey && scorecard;
  const isMessageStep = hasTemplate && (step.actionType === 'email' || step.actionType === 'text');

  const party = isAwait && step.externalPartyType
    ? EXTERNAL_PARTIES.find(p => p.type === step.externalPartyType) ?? null
    : null;

  async function openPreview() {
    if (!step.templateId) return;
    const result = await service.renderTemplate(step.templateId, loanId);
    setPreview(result);
    setPreviewOpen(true);
  }

  function handleSent() {
    onMarkSent(step.id);
    // Auto-log a comment noting what was sent
    const label = step.actionType === 'text' ? 'Text sent' : 'Email sent';
    service.addComment(loanId, stageId, `${label}: ${step.label}${preview?.subject ? ` — "${preview.subject}"` : ''}`);
  }

  return (
    <>
      <li
        className={`flex items-start gap-2 rounded-md p-1.5 -mx-1.5 ${
          isCritical && status !== 'done'
            ? 'bg-[#f87168]/5 border border-[#f87168]/25'
            : ''
        }`}
      >
        <button
          onClick={onToggle}
          className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
          title={`Toggle: ${status}`}
        >
          <StatusIcon status={status} critical={isCritical && status !== 'done'} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-start gap-1.5 flex-wrap">
            <span className="text-[10px] text-[#7a8899] mt-0.5 flex-shrink-0">{step.order}.</span>
            <span
              className={`text-sm leading-snug flex-1 ${
                status === 'done' ? 'text-[#7a8899] line-through' :
                status === 'na'   ? 'text-[#7a8899] italic' :
                isCritical        ? 'text-[#f87168]' : 'text-[#b6c2cf]'
              }`}
            >
              {step.label}
              {isCritical && status !== 'done' && (
                <span className="ml-1.5 text-[10px] font-bold text-[#f87168] uppercase tracking-wide">Critical</span>
              )}
            </span>
          </div>

          {/* Chips: owner + action */}
          {(step.ownerRole || step.actionType) && (
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {step.ownerRole && <OwnerChip role={step.ownerRole} />}
              {step.actionType && <ActionChip type={step.actionType} />}
            </div>
          )}

          {/* Desired outcome */}
          {step.desiredOutcome && (
            <p className="text-[11px] text-[#7a8899] mt-1 leading-snug italic">{step.desiredOutcome}</p>
          )}

          {/* Waiting on party */}
          {isAwait && party && <PartyCard party={party} />}

          {/* Send / preview button */}
          {isMessageStep && status !== 'done' && (
            <button
              onClick={openPreview}
              className="mt-1.5 text-[11px] text-[#579dff] hover:text-[#82b4ff] transition-colors flex items-center gap-1 font-medium"
            >
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M1 6l10-4-4 9-1.5-3L1 6z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              {step.actionType === 'text' ? 'Preview & Send Text' : 'Preview & Send Email'}
            </button>
          )}
          {isMessageStep && status === 'done' && (
            <button
              onClick={openPreview}
              className="mt-1.5 text-[11px] text-[#7a8899] hover:text-[#b6c2cf] transition-colors flex items-center gap-1"
            >
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <rect x="1" y="2.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 4l5 3 5-3" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              View template
            </button>
          )}

          {/* Scorecard */}
          {showScorecard && <ScorecardWidget sc={scorecard} />}
        </div>
      </li>

      {previewOpen && preview && (
        <TemplatePreviewModal
          subject={preview.subject}
          body={preview.body}
          channel={step.actionType === 'text' ? 'text' : 'email'}
          stepLabel={step.label}
          onClose={() => setPreviewOpen(false)}
          onSent={handleSent}
        />
      )}
    </>
  );
}

// ─── Sub-workflow group ────────────────────────────────────────────────────────

function SubWorkflowGroup({
  title,
  steps,
  loanId,
  stageId,
  getStatus,
  onToggle,
  onMarkSent,
  scorecard,
}: {
  title: string;
  steps: ProcessStep[];
  loanId: string;
  stageId: string;
  getStatus: (id: string) => StepStatus;
  onToggle: (stepId: string) => void;
  onMarkSent: (stepId: string) => void;
  scorecard: UnderwritingScorecard | null;
}) {
  const [open, setOpen] = useState(false);
  const done = steps.filter(s => getStatus(s.id) === 'done').length;

  return (
    <li className="border border-[#3d4b5c] rounded-md overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-[#1d2125] hover:bg-[#222a30] transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-xs font-semibold text-[#e8ecf0]">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#7a8899]">{done}/{steps.length}</span>
          <svg viewBox="0 0 12 12" fill="none" className={`w-3 h-3 text-[#7a8899] transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </button>
      {open && (
        <ul className="space-y-1.5 p-3 pt-2">
          {steps.map(step => (
            <StepRow
              key={step.id}
              step={step}
              status={getStatus(step.id)}
              loanId={loanId}
              stageId={stageId}
              onToggle={() => onToggle(step.id)}
              onMarkSent={onMarkSent}
              scorecard={scorecard}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Main checklist ────────────────────────────────────────────────────────────

interface StageStepChecklistProps {
  loanId: string;
  stageId: string;
  isCurrentStage: boolean;
  onStepStatusChanged?: () => void; // notify parent (e.g. to refresh comments)
}

export function StageStepChecklist({ loanId, stageId, isCurrentStage, onStepStatusChanged }: StageStepChecklistProps) {
  const service = useLoanService();
  const { showToast } = useToast();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [statuses, setStatuses] = useState<LoanStepStatus[]>([]);
  const [scorecard, setScorecard] = useState<UnderwritingScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  const stage = STAGES.find(s => s.id === stageId);

  const load = useCallback(async () => {
    setLoading(true);
    const [fetchedSteps, fetchedStatuses] = await Promise.all([
      service.getStageSteps(stageId),
      service.getStepStatuses(loanId),
    ]);
    setSteps(fetchedSteps);
    setStatuses(fetchedStatuses);

    // Load scorecard if this stage has underwriting steps
    if (fetchedSteps.some(s => s.ruleKey)) {
      const sc = await service.getScorecard(loanId);
      setScorecard(sc);
    }

    setLoading(false);
  }, [service, stageId, loanId]);

  useEffect(() => { load(); }, [load]);

  function getStatus(stepId: string): StepStatus {
    return statuses.find(s => s.stepId === stepId)?.status ?? 'not_done';
  }

  async function handleToggle(stepId: string) {
    const current = getStatus(stepId);
    const next = nextStatus(current);
    setStatuses(prev => {
      const existing = prev.find(s => s.stepId === stepId);
      if (existing) return prev.map(s => s.stepId === stepId ? { ...s, status: next } : s);
      return [...prev, { id: `opt-${stepId}`, loanId, stepId, status: next, completedBy: null, completedAt: null }];
    });
    try {
      const updated = await service.setStepStatus(loanId, stepId, next);
      setStatuses(prev => prev.map(s => s.stepId === stepId ? updated : s));
      onStepStatusChanged?.();
    } catch {
      setStatuses(prev => prev.map(s => s.stepId === stepId ? { ...s, status: current } : s));
    }
  }

  async function handleMarkSent(stepId: string) {
    // Mark the step done via the same toggle path
    setStatuses(prev => {
      const existing = prev.find(s => s.stepId === stepId);
      if (existing) return prev.map(s => s.stepId === stepId ? { ...s, status: 'done' } : s);
      return [...prev, { id: `opt-${stepId}`, loanId, stepId, status: 'done', completedBy: null, completedAt: null }];
    });
    try {
      const updated = await service.setStepStatus(loanId, stepId, 'done');
      setStatuses(prev => prev.map(s => s.stepId === stepId ? updated : s));
      onStepStatusChanged?.();
      showToast('Email sent — step marked complete', 'success');
    } catch {
      // Step still shows sent in UI since service is in-memory mock
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center gap-2 text-[#7a8899] text-sm">
        <span className="animate-spin h-4 w-4 border-2 border-[#3d4b5c] border-t-[#579dff] rounded-full" />
        Loading…
      </div>
    );
  }

  // Separate normal steps from sub-workflow steps
  const mainSteps = steps.filter(s => !s.subWorkflow);
  const drawSteps = steps.filter(s => s.subWorkflow === 'draw');
  const extensionSteps = steps.filter(s => s.subWorkflow === 'extension');

  const doneCount = steps.filter(s => {
    const st = getStatus(s.id);
    return st === 'done' || st === 'na';
  }).length;

  const criticalUnmet = steps.filter(s => s.severity === 'critical' && getStatus(s.id) !== 'done');

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {stage && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />}
        <span className="text-sm font-semibold text-[#e8ecf0]">{stage?.name ?? stageId}</span>
        {isCurrentStage && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3d4b5c] text-[#7a8899]">Current</span>
        )}
        <span className="ml-auto text-xs text-[#7a8899]">{doneCount} / {steps.length} complete</span>
      </div>

      {/* Critical gates banner */}
      {isCurrentStage && criticalUnmet.length > 0 && (
        <div className="mb-3 p-2 rounded-md bg-[#f87168]/10 border border-[#f87168]/30 flex items-start gap-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 text-[#f87168] flex-shrink-0 mt-0.5">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25"/>
            <path d="M8 5v4M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-[11px] text-[#f87168] leading-snug">
            {criticalUnmet.length} critical gate{criticalUnmet.length > 1 ? 's' : ''} unmet:{' '}
            {criticalUnmet.map(s => s.label).join(', ')}
          </p>
        </div>
      )}

      {/* Main steps */}
      <ul className="space-y-1.5">
        {mainSteps.map(step => (
          <StepRow
            key={step.id}
            step={step}
            status={getStatus(step.id)}
            loanId={loanId}
            stageId={stageId}
            onToggle={() => handleToggle(step.id)}
            onMarkSent={handleMarkSent}
            scorecard={scorecard}
          />
        ))}

        {/* Sub-workflow groups */}
        {drawSteps.length > 0 && (
          <SubWorkflowGroup
            title="Draw Program"
            steps={drawSteps}
            loanId={loanId}
            stageId={stageId}
            getStatus={getStatus}
            onToggle={handleToggle}
            onMarkSent={handleMarkSent}
            scorecard={scorecard}
          />
        )}
        {extensionSteps.length > 0 && (
          <SubWorkflowGroup
            title="Extension"
            steps={extensionSteps}
            loanId={loanId}
            stageId={stageId}
            getStatus={getStatus}
            onToggle={handleToggle}
            onMarkSent={handleMarkSent}
            scorecard={scorecard}
          />
        )}
      </ul>
    </div>
  );
}
