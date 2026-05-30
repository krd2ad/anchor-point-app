import type { Loan } from '../../types';
import { loanRiskScore, type RiskLevel } from '../../lib/riskScore';
import { STAGES } from '../../data/stages';
import { useFileTree } from '../../context/LoanServiceProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; pulse: boolean }> = {
  low:      { bg: '#4bce97',  text: '#1d2125', pulse: false },
  medium:   { bg: '#f5cd47',  text: '#1d2125', pulse: false },
  high:     { bg: '#f87168',  text: '#1d2125', pulse: false },
  critical: { bg: '#e2483d',  text: '#ffffff', pulse: true  },
};

function ltvColor(ltv: number): string {
  if (ltv > 0.75) return '#f87168';
  if (ltv > 0.65) return '#f5cd47';
  return '#4bce97';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface LoanHealthStripProps {
  loan: Loan;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoanHealthStrip({ loan }: LoanHealthStripProps) {
  const risk = loanRiskScore(loan);
  const riskCfg = RISK_COLORS[risk.level];
  const stage = STAGES.find((s) => s.id === loan.stageId);

  // Document completeness from the file tree
  const { attachments } = useFileTree();
  const loanAttachments = attachments.filter(a => a.loanId === loan.id);
  const verifiedCount = loanAttachments.filter(a => a.status === 'verified').length;
  const totalDocs = loanAttachments.length;
  const docsColor =
    totalDocs === 0
      ? '#5d6f7e'
      : verifiedCount === totalDocs
        ? '#4bce97'
        : loanAttachments.some(a => a.status === 'requested')
          ? '#f5cd47'
          : '#579dff';

  return (
    <div className="bg-[#1d2125] border-b border-[#3d4b5c] px-4 py-2 flex items-center gap-4 text-[11px]">
      {/* Risk pill */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider leading-none${
          riskCfg.pulse ? ' animate-pulse' : ''
        }`}
        style={{ backgroundColor: riskCfg.bg, color: riskCfg.text }}
        title={risk.reasons.length > 0 ? risk.reasons.join(', ') : 'No risk factors'}
      >
        {risk.level}
      </span>

      {/* LTV */}
      {loan.computedLtv != null && (
        <span className="flex items-center gap-1">
          <span className="text-[#5d6f7e]">LTV</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: ltvColor(loan.computedLtv) }}
          >
            {(loan.computedLtv * 100).toFixed(0)}%
          </span>
        </span>
      )}

      {/* Stage */}
      {stage && (
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-[#b6c2cf]">{stage.name}</span>
        </span>
      )}

      {/* Auto pay chip */}
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium leading-none ${
          loan.autoPayEnabled
            ? 'bg-[#4bce97]/10 text-[#4bce97]'
            : 'bg-[#3d4b5c] text-[#7a8899]'
        }`}
      >
        {loan.autoPayEnabled ? 'Auto Pay ✓' : 'Manual'}
      </span>

      {/* Document completeness */}
      {totalDocs > 0 && (
        <span className="flex items-center gap-1 ml-auto">
          <span className="text-[#5d6f7e]">Docs</span>
          <span className="font-semibold tabular-nums" style={{ color: docsColor }}>
            {verifiedCount}/{totalDocs}
          </span>
        </span>
      )}
    </div>
  );
}
