import type { ActionType, OwnerRole } from '../../types';

// ─── Action type chip ──────────────────────────────────────────────────────────

interface ActionChipProps { type: ActionType }

const ACTION_META: Record<ActionType, { label: string; bg: string; text: string }> = {
  email:            { label: 'Email',    bg: '#579dff22', text: '#579dff' },
  text:             { label: 'Text',     bg: '#6cc3e022', text: '#6cc3e0' },
  gather:           { label: 'Gather',   bg: '#9f8fef22', text: '#9f8fef' },
  approval:         { label: 'Approve',  bg: '#4bce9722', text: '#4bce97' },
  await_third_party:{ label: 'Waiting',  bg: '#f5cd4722', text: '#f5cd47' },
  file:             { label: 'File',     bg: '#b6c2cf22', text: '#b6c2cf' },
  compute:          { label: 'Compute',  bg: '#9f8fef22', text: '#9f8fef' },
  decision:         { label: 'Decision', bg: '#f87168/20', text: '#f87168' },
  hold:             { label: 'Hold',     bg: '#3d4b5c',   text: '#7a8899' },
};

export function ActionChip({ type }: ActionChipProps) {
  const m = ACTION_META[type];
  return (
    <span
      className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none"
      style={{ backgroundColor: m.bg, color: m.text }}
    >
      {m.label}
    </span>
  );
}

// ─── Owner role chip ───────────────────────────────────────────────────────────

interface OwnerChipProps { role: OwnerRole }

const OWNER_META: Record<OwnerRole, { label: string; color: string }> = {
  Originator:  { label: 'Originator', color: '#9f8fef' },
  Camila:      { label: 'Camila',     color: '#f5cd47' },
  Rivers:      { label: 'Rivers',     color: '#579dff' },
  Sam:         { label: 'Sam',        color: '#4bce97' },
  RiversOrSam: { label: 'R or S',     color: '#6cc3e0' },
  Processor:   { label: 'Processor',  color: '#b6c2cf' },
  System:      { label: 'System',     color: '#454f59' },
};

export function OwnerChip({ role }: OwnerChipProps) {
  const m = OWNER_META[role];
  return (
    <span
      className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-none border"
      style={{ color: m.color, borderColor: m.color + '55', backgroundColor: m.color + '18' }}
    >
      {m.label}
    </span>
  );
}
