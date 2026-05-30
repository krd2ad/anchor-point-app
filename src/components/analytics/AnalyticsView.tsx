import { useLoans, useSelectedLoan, useFileTree } from '../../context/LoanServiceProvider';
import { STAGES } from '../../data/stages';
import { loanRiskScore, type RiskLevel } from '../../lib/riskScore';
import type { Loan } from '../../types';
import { formatAmount as fmtMoney, ltvColor, daysSince } from '../../lib/formatters';

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: '#4bce97', bg: 'rgba(75,206,151,0.10)' },
  medium:   { label: 'Medium',   color: '#f5cd47', bg: 'rgba(245,205,71,0.10)' },
  high:     { label: 'High',     color: '#f87168', bg: 'rgba(248,113,104,0.10)' },
  critical: { label: 'Critical', color: '#e2483d', bg: 'rgba(226,72,61,0.15)'  },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  valueColor,
  sub,
}: {
  title: string;
  value: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#282e33] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-[#7a8899] font-medium">
        {title}
      </span>
      <span
        className="text-2xl font-bold tabular-nums"
        style={{ color: valueColor ?? '#e8ecf0' }}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-[#5d6f7e]">{sub}</span>}
    </div>
  );
}

// ─── Pipeline Distribution bar (pure SVG/CSS) ─────────────────────────────────

function PipelineBar({ loans }: { loans: Loan[] }) {
  // Only stages 1–7 (8 = completed, shown separately)
  const activeStages = STAGES.slice(0, 7);
  const total = loans.filter((l) => l.stageId !== 'stage-8').length || 1;

  const counts = activeStages.map((s) => ({
    stage: s,
    count: loans.filter((l) => l.stageId === s.id).length,
  }));

  return (
    <div className="bg-[#282e33] rounded-lg p-4">
      <h3 className="text-[11px] uppercase tracking-widest text-[#7a8899] font-medium mb-3">
        Pipeline Distribution
      </h3>

      {/* Stacked horizontal bar */}
      <div className="flex h-8 rounded-md overflow-hidden mb-3">
        {counts.map(({ stage, count }) => {
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={stage.id}
              style={{ width: `${pct}%`, backgroundColor: stage.color }}
              title={`${stage.name}: ${count}`}
              className="flex items-center justify-center text-[10px] font-bold text-[#1d2125] transition-all"
            >
              {count > 0 ? count : ''}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {counts.map(({ stage, count }) => (
          <div key={stage.id} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[11px] text-[#7a8899]">
              {stage.name}{' '}
              <span className="text-[#b6c2cf] font-medium">{count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Portfolio by Entity ───────────────────────────────────────────────────────

function EntityTable({ loans }: { loans: Loan[] }) {
  const entities = ['APL'] as const;

  const rows = entities.map((entity) => {
    const subset = loans.filter((l) => l.lendingEntity === entity);
    const totalValue = subset.reduce((s, l) => s + l.loanAmount, 0);
    const ltvVals = subset
      .map((l) => l.computedLtv)
      .filter((v): v is number => v != null);
    const avgLtv = ltvVals.length > 0
      ? ltvVals.reduce((s, v) => s + v, 0) / ltvVals.length
      : null;
    return { entity, count: subset.length, totalValue, avgLtv };
  });

  return (
    <div className="bg-[#282e33] rounded-lg p-4 flex flex-col">
      <h3 className="text-[11px] uppercase tracking-widest text-[#7a8899] font-medium mb-3">
        Portfolio by Entity
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#3d4b5c]">
            {['Entity', 'Count', 'Total Value', 'Avg LTV'].map((h) => (
              <th
                key={h}
                className="pb-2 text-left text-[11px] text-[#5d6f7e] font-medium"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.entity} className="border-b border-[#2d3748] last:border-0">
              <td className="py-2 text-[#e8ecf0] font-semibold text-sm">{r.entity}</td>
              <td className="py-2 text-[#b6c2cf] text-sm">{r.count}</td>
              <td className="py-2 text-[#b6c2cf] text-sm">{fmtMoney(r.totalValue)}</td>
              <td className="py-2 text-sm">
                {r.avgLtv != null ? (
                  <span style={{ color: ltvColor(r.avgLtv) }}>
                    {(r.avgLtv * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[#5d6f7e]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Risk Breakdown ────────────────────────────────────────────────────────────

function RiskBreakdown({ loans }: { loans: Loan[] }) {
  const levels: RiskLevel[] = ['critical', 'high', 'medium', 'low'];
  const counts = Object.fromEntries(
    levels.map((lvl) => [
      lvl,
      loans.filter((l) => loanRiskScore(l).level === lvl).length,
    ]),
  ) as Record<RiskLevel, number>;

  return (
    <div className="bg-[#282e33] rounded-lg p-4 flex flex-col">
      <h3 className="text-[11px] uppercase tracking-widest text-[#7a8899] font-medium mb-3">
        Risk Breakdown
      </h3>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {levels.map((lvl) => {
          const cfg = RISK_CONFIG[lvl];
          return (
            <div
              key={lvl}
              className="rounded-md p-3 flex flex-col gap-1"
              style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40` }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              <span className="text-2xl font-bold" style={{ color: cfg.color }}>
                {counts[lvl]}
              </span>
              <span className="text-[10px] text-[#5d6f7e]">
                {counts[lvl] === 1 ? 'loan' : 'loans'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pipeline Velocity ────────────────────────────────────────────────────────

function PipelineVelocity({ loans }: { loans: Loan[] }) {
  const activeStages = STAGES.slice(0, 7); // stages 1–7

  const rows = activeStages.map((stage) => {
    const stageLoans = loans.filter((l) => l.stageId === stage.id);
    if (stageLoans.length === 0) return { stage, avg: null };
    const days = stageLoans.map((l) => daysSince(l.updatedAt));
    const avg = Math.floor(days.reduce((s, d) => s + d, 0) / days.length);
    return { stage, avg };
  });

  const maxAvg = Math.max(...rows.map((r) => r.avg ?? 0), 1);

  return (
    <div className="bg-[#282e33] rounded-xl p-5 border border-[#3d4b5c]">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#e8ecf0]">Pipeline Velocity</h3>
        <p className="text-[11px] text-[#7a8899] mt-0.5">
          Average days per stage (based on last update)
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map(({ stage, avg }) => (
          <div key={stage.id} className="flex items-center gap-3">
            {/* Stage name */}
            <span
              className="text-[11px] font-medium text-[#b6c2cf] w-36 flex-shrink-0 truncate"
              title={stage.name}
            >
              {stage.name}
            </span>
            {/* Bar */}
            <div className="flex-1 h-5 bg-[#1d2125] rounded overflow-hidden">
              {avg !== null ? (
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${Math.max((avg / maxAvg) * 100, 2)}%`,
                    backgroundColor: stage.color + '99', // ~60% opacity
                  }}
                />
              ) : null}
            </div>
            {/* Label */}
            <span className="text-[11px] font-medium tabular-nums w-14 text-right flex-shrink-0 text-[#7a8899]">
              {avg !== null ? `${avg}d avg` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Concentration Risk ────────────────────────────────────────────────────────

interface ConcentrationWarning {
  key: string;
  message: string;
}

function ConcentrationRisk({ loans }: { loans: Loan[] }) {
  const warnings: ConcentrationWarning[] = [];
  const totalValue = loans.reduce((s, l) => s + l.loanAmount, 0);
  if (totalValue === 0) return null;

  // 1. Entity concentration (single entity > 80% — N/A now all APL, kept for future)
  for (const entity of ['APL'] as const) {
    const entityValue = loans
      .filter(l => l.lendingEntity === entity)
      .reduce((s, l) => s + l.loanAmount, 0);
    const pct = entityValue / totalValue;
    if (pct > 0.8) {
      warnings.push({
        key: `entity-${entity}`,
        message: `${entity} holds ${(pct * 100).toFixed(0)}% of portfolio value (${fmtMoney(entityValue)} of ${fmtMoney(totalValue)}) — entity concentration risk`,
      });
    }
  }

  // 2. Stage concentration: > 50% of active loans in one stage
  const activeLoans = loans.filter(l => l.stageId !== 'stage-8');
  if (activeLoans.length > 0) {
    const stageCounts = new Map<string, number>();
    for (const l of activeLoans) {
      stageCounts.set(l.stageId, (stageCounts.get(l.stageId) ?? 0) + 1);
    }
    for (const [stageId, count] of stageCounts) {
      const pct = count / activeLoans.length;
      if (pct > 0.5) {
        const stageName = STAGES.find(s => s.id === stageId)?.name ?? stageId;
        warnings.push({
          key: `stage-${stageId}`,
          message: `${count} of ${activeLoans.length} active loans (${(pct * 100).toFixed(0)}%) are in "${stageName}" — stage concentration risk`,
        });
      }
    }
  }

  // 3. Single-loan concentration: any single loan > 30% of total portfolio
  for (const loan of loans) {
    const pct = loan.loanAmount / totalValue;
    if (pct > 0.3) {
      warnings.push({
        key: `loan-${loan.id}`,
        message: `"${loan.displayLabel}" represents ${(pct * 100).toFixed(0)}% of portfolio value (${fmtMoney(loan.loanAmount)} of ${fmtMoney(totalValue)}) — single-loan concentration risk`,
      });
    }
  }

  return (
    <div className="bg-[#282e33] rounded-xl p-5 border border-[#3d4b5c]">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[#e8ecf0]">Concentration Risk</h3>
        <p className="text-[11px] text-[#7a8899] mt-0.5">
          Flags when any single entity, stage, or loan dominates the portfolio
        </p>
      </div>

      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#4bce97]/10 border border-[#4bce97]/25">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-[#4bce97] flex-shrink-0">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4.5 7l1.75 1.75L9.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-medium text-[#4bce97]">
            No concentration risks detected
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {warnings.map(w => (
            <div
              key={w.key}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-md border"
              style={{
                backgroundColor: 'rgba(245,205,71,0.07)',
                borderColor: 'rgba(245,205,71,0.35)',
              }}
            >
              {/* Amber warning icon */}
              <svg
                viewBox="0 0 14 14"
                fill="none"
                className="w-3.5 h-3.5 flex-shrink-0 mt-px"
                style={{ color: '#f5cd47' }}
              >
                <path
                  d="M7 1.5L13 12H1L7 1.5z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path d="M7 5.5v3M7 10h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <p className="text-[11px] leading-snug" style={{ color: '#d4aa30' }}>
                {w.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Loan Table ────────────────────────────────────────────────────────────────

const RISK_ORDER: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };

interface LoanTableProps {
  loans: Loan[];
  onSelectLoan: (id: string) => void;
}

function LoanTable({ loans, onSelectLoan }: LoanTableProps) {
  const stageById = new Map(STAGES.map((s) => [s.id, s]));

  const sorted = [...loans].sort((a, b) => {
    const ra = loanRiskScore(a);
    const rb = loanRiskScore(b);
    const rDiff = RISK_ORDER[ra.level] - RISK_ORDER[rb.level];
    if (rDiff !== 0) return rDiff;
    const sa = stageById.get(a.stageId)?.order ?? 99;
    const sb = stageById.get(b.stageId)?.order ?? 99;
    return sa - sb;
  });

  return (
    <div className="bg-[#282e33] rounded-lg p-4">
      <h3 className="text-[11px] uppercase tracking-widest text-[#7a8899] font-medium mb-3">
        All Loans
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3d4b5c]">
              {['Display Label', 'Stage', 'Amount', 'LTV%', 'Risk', 'Status'].map((h) => (
                <th
                  key={h}
                  className="pb-2 text-left text-[11px] text-[#5d6f7e] font-medium pr-4 last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((loan) => {
              const stage = stageById.get(loan.stageId);
              const risk = loanRiskScore(loan);
              const cfg = RISK_CONFIG[risk.level];
              const isCompleted = loan.stageId === 'stage-8';

              return (
                <tr
                  key={loan.id}
                  onClick={() => onSelectLoan(loan.id)}
                  className="border-b border-[#2d3748] last:border-0 hover:bg-[#2d3748] cursor-pointer transition-colors"
                >
                  <td className="py-2 pr-4">
                    <span className="text-[#e8ecf0] font-medium text-xs truncate max-w-[160px] block">
                      {loan.displayLabel}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        color: stage?.color ?? '#b6c2cf',
                        backgroundColor: `${stage?.color ?? '#b6c2cf'}20`,
                      }}
                    >
                      {stage?.name ?? loan.stageId}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-[#b6c2cf] text-xs tabular-nums">
                    {fmtMoney(loan.loanAmount)}
                  </td>
                  <td className="py-2 pr-4 text-xs tabular-nums">
                    {loan.computedLtv != null ? (
                      <span style={{ color: ltvColor(loan.computedLtv) }}>
                        {(loan.computedLtv * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-[#5d6f7e]">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-2">
                    <span
                      className={`text-[11px] font-medium ${
                        isCompleted ? 'text-[#4bce97]' : 'text-[#579dff]'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Portfolio heat map ───────────────────────────────────────────────────────

const HEAT_CONFIG: Record<string, { border: string; bg: string; label: string }> = {
  critical: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)',    label: 'Critical' },
  high:     { border: '#f97316', bg: 'rgba(249,115,22,0.10)',   label: 'High' },
  medium:   { border: '#eab308', bg: 'rgba(234,179,8,0.08)',    label: 'Medium' },
  low:      { border: '#166534', bg: 'rgba(22,101,52,0.10)',    label: 'Low' },
};

function HeatMap({ loans, onSelectLoan }: { loans: Loan[]; onSelectLoan: (id: string) => void }) {
  const stageMap = new Map(STAGES.map(s => [s.id, s]));
  const sorted = [...loans].sort((a, b) => {
    const ra = loanRiskScore(a).level;
    const rb = loanRiskScore(b).level;
    const rDiff = (RISK_ORDER[ra] ?? 3) - (RISK_ORDER[rb] ?? 3);
    if (rDiff !== 0) return rDiff;
    return b.loanAmount - a.loanAmount;
  });

  return (
    <div className="bg-[#282e33] rounded-xl p-5 border border-[#3d4b5c]">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#e8ecf0]">Portfolio Heat Map</h3>
        <p className="text-[11px] text-[#7a8899]">Click any loan to view on board</p>
      </div>
      <div className="flex gap-3 mb-3">
        {Object.entries(HEAT_CONFIG).map(([level, cfg]) => (
          <span key={level} className="flex items-center gap-1 text-[10px] text-[#7a8899]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.border }} />
            {cfg.label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {sorted.map(loan => {
          const { level } = loanRiskScore(loan);
          const cfg = HEAT_CONFIG[level];
          const stage = stageMap.get(loan.stageId);
          return (
            <button
              key={loan.id}
              onClick={() => onSelectLoan(loan.id)}
              className="text-left rounded-md p-2.5 border-l-2 transition-all hover:brightness-125 cursor-pointer"
              style={{ backgroundColor: cfg.bg, borderLeftColor: cfg.border }}
            >
              <p className="text-xs font-medium text-[#e8ecf0] truncate leading-snug mb-0.5">{loan.displayLabel}</p>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-[#7a8899] truncate">{stage?.name ?? loan.stageId}</span>
                <span className="text-[10px] font-mono text-[#b6c2cf] flex-shrink-0">
                  {fmtMoney(loan.loanAmount)}
                </span>
              </div>
              {loan.computedLtv != null && (
                <p className="text-[10px] mt-0.5" style={{ color: ltvColor(loan.computedLtv) }}>
                  LTV {(loan.computedLtv * 100).toFixed(0)}%
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main AnalyticsView ────────────────────────────────────────────────────────

interface AnalyticsViewProps {
  onSelectLoanAndSwitchToBoard: (loanId: string) => void;
}

export function AnalyticsView({ onSelectLoanAndSwitchToBoard }: AnalyticsViewProps) {
  const { loans, loading } = useLoans();
  const { attachments } = useFileTree();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-4 border-[#3d4b5c] border-t-[#579dff] rounded-full" />
      </div>
    );
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const activeLoans = loans.filter((l) => l.stageId !== 'stage-8');
  const totalPortfolioValue = loans.reduce((s, l) => s + l.loanAmount, 0);

  const ltvValues = loans
    .map((l) => l.computedLtv)
    .filter((v): v is number => v != null);
  const avgLtv = ltvValues.length > 0
    ? ltvValues.reduce((s, v) => s + v, 0) / ltvValues.length
    : null;

  const atRiskCount = loans.filter((l) => {
    const { level } = loanRiskScore(l);
    return level === 'critical' || level === 'high';
  }).length;

  // Attachment counts per loan
  const attachCountByLoan = new Map<string, number>();
  for (const att of attachments) {
    attachCountByLoan.set(att.loanId, (attachCountByLoan.get(att.loanId) ?? 0) + 1);
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1d2125] p-6">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ── Row 1: KPI cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            title="Total Portfolio Value"
            value={fmtMoney(totalPortfolioValue)}
            sub={`${loans.length} loans total`}
          />
          <KpiCard
            title="Active Loans"
            value={String(activeLoans.length)}
            sub="Excluding completed"
          />
          <KpiCard
            title="Avg LTV"
            value={avgLtv != null ? `${(avgLtv * 100).toFixed(1)}%` : '—'}
            valueColor={avgLtv != null ? ltvColor(avgLtv) : '#5d6f7e'}
            sub="Across all loans"
          />
          <KpiCard
            title="At-Risk Loans"
            value={String(atRiskCount)}
            valueColor={atRiskCount > 0 ? '#f87168' : '#4bce97'}
            sub="Critical or high risk"
          />
        </div>

        {/* ── Row 2: Pipeline distribution ───────────────────────────────────── */}
        <PipelineBar loans={loans} />

        {/* ── Row 3: Entity table + Risk breakdown ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <EntityTable loans={loans} />
          <RiskBreakdown loans={loans} />
        </div>

        {/* ── Row 4: Pipeline Velocity ───────────────────────────────────────── */}
        <PipelineVelocity loans={loans} />

        {/* ── Row 5: Concentration Risk ──────────────────────────────────────── */}
        <ConcentrationRisk loans={loans} />

        {/* ── Row 6: Loan table ──────────────────────────────────────────────── */}
        <LoanTable loans={loans} onSelectLoan={onSelectLoanAndSwitchToBoard} />

        {/* ── Row 7: Portfolio heat map ───────────────────────────────────────── */}
        <HeatMap loans={loans} onSelectLoan={onSelectLoanAndSwitchToBoard} />
      </div>
    </div>
  );
}
