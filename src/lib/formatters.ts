/** Format a dollar amount as $1.3M, $75k, or $1,234 */
export function formatAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

/** Color for an LTV ratio (0–1 scale). >70% = red, >65% = yellow, else green */
export function ltvColor(ltv: number): string {
  if (ltv > 0.70) return '#f87168';
  if (ltv > 0.65) return '#f5cd47';
  return '#4bce97';
}

/** Days between two ISO date strings (or from dateIso to now if toIso omitted) */
export function daysSince(fromIso: string, toIso?: string): number {
  const to = toIso ? new Date(toIso).getTime() : Date.now();
  return Math.floor((to - new Date(fromIso).getTime()) / 86_400_000);
}

/** Format a Date or ISO string as "Jan 1, 2025" */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format a dollar amount as currency string with no decimals */
export function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const AVATAR_PALETTE = ['#579dff', '#9f8fef', '#4bce97', '#f5cd47', '#f87168', '#6cc3e0'];

/** Deterministic hex background color for an avatar, derived from the author ID */
export function avatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

/** Two-letter initials derived from an author ID string */
export function avatarInitials(id: string): string {
  return id.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2) || 'U';
}
