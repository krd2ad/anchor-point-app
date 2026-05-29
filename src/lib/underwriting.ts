import type { Loan, Parcel, UnderwritingScorecard, ScorecardRuleResult } from '../types';

// ─── Bridge Loan Program Rules ────────────────────────────────────────────────

export const PROGRAM_RULES = {
  loanSizeMin: 100_000,
  loanSizeMax: 2_000_000,
  termMonthsMin: 3,
  termMonthsMax: 12,
  baseRatePct: 14,
  basePointsPct: 4,
  maxLtvStabilized: 0.70,
  targetLtv: 0.65,
  targetLtc: 0.75,
  minDscr: 1.25,
  minDebtYield: 0.10,
  minEquityPct: 0.20,
  minLiquidityPct: 0.10,
  minAnchorPoints: 2,
  eligiblePropertyTypes: ['SFR', 'Commercial', 'Land'] as const,
  lendingStates: [
    'AL','AR','CO','CT','DE','GA','IN','IA','ID','KS','KY','LA',
    'ME','MD','MI','MS','MO','MT','NE','NH','NC','OH','OK','PA',
    'RI','SC','TN','TX','UT','VA','WA','WV','WI','WY',
  ] as const,
} as const;

// ─── State risk buckets ───────────────────────────────────────────────────────

const LOW_RISK_STATES  = new Set(['AL','AR','CO','GA','IN','KS','KY','LA','MO','NE','NC','OH','OK','SC','TN','TX','VA','WV','WY']);
const MED_RISK_STATES  = new Set(['CT','DE','IA','ID','MD','MI','MT','NH','PA','RI','WA','WI']);
const HIGH_RISK_STATES = new Set(['ME','MN','ND','OR','UT']);

export type StateRiskBucket = 'low' | 'medium' | 'high' | 'unknown';

export function stateRiskBucket(state: string): StateRiskBucket {
  const s = state.toUpperCase();
  if (LOW_RISK_STATES.has(s))  return 'low';
  if (MED_RISK_STATES.has(s))  return 'medium';
  if (HIGH_RISK_STATES.has(s)) return 'high';
  return 'unknown';
}

// ─── Pure compute functions ───────────────────────────────────────────────────

export function ltv(loanAmount: number, stabilizedValue: number): number | null {
  if (!stabilizedValue) return null;
  return loanAmount / stabilizedValue;
}

export function ltc(loanAmount: number, projectCost: number): number | null {
  if (!projectCost) return null;
  return loanAmount / projectCost;
}

export function dscr(noi: number, annualDebtService: number): number | null {
  if (!annualDebtService) return null;
  return noi / annualDebtService;
}

export function debtYield(noi: number, loanAmount: number): number | null {
  if (!loanAmount) return null;
  return noi / loanAmount;
}

export function liquidityOk(postClosingLiquidity: number, loanAmount: number): boolean {
  return postClosingLiquidity >= PROGRAM_RULES.minLiquidityPct * loanAmount;
}

export function equityOk(borrowerEquity: number, stabilizedValue: number): boolean {
  if (!stabilizedValue) return false;
  return borrowerEquity / stabilizedValue >= PROGRAM_RULES.minEquityPct;
}

// ─── Scorecard builder ───────────────────────────────────────────────────────

interface ScorecardInputs {
  loanAmount: number;
  stabilizedValue?: number;    // total parcel valuation
  anchorPointCount?: number;   // how many valuation sources were provided
  noi?: number;
  annualDebtService?: number;
  projectCost?: number;
  postClosingLiquidity?: number;
  borrowerEquity?: number;
  parcelState?: string;
}

export function buildScorecard(
  loanId: string,
  inputs: ScorecardInputs,
): UnderwritingScorecard {
  const {
    loanAmount,
    stabilizedValue,
    anchorPointCount = 0,
    noi,
    annualDebtService,
    projectCost,
    postClosingLiquidity,
    borrowerEquity,
  } = inputs;

  const computedLtv = stabilizedValue ? ltv(loanAmount, stabilizedValue) : null;
  const computedLtc = projectCost ? ltc(loanAmount, projectCost) : null;
  const computedDscr = noi && annualDebtService ? dscr(noi, annualDebtService) : null;
  const computedDy   = noi ? debtYield(noi, loanAmount) : null;
  const computedLiqOk = postClosingLiquidity != null
    ? liquidityOk(postClosingLiquidity, loanAmount) : null;
  const computedEqOk  = borrowerEquity != null && stabilizedValue
    ? equityOk(borrowerEquity, stabilizedValue) : null;

  const rules: ScorecardRuleResult[] = [
    {
      key: 'loan_size',
      label: 'Loan Size',
      result: loanAmount >= PROGRAM_RULES.loanSizeMin && loanAmount <= PROGRAM_RULES.loanSizeMax
        ? 'pass' : 'fail',
      detail: `$${loanAmount.toLocaleString()} — range $100k–$2MM`,
    },
    {
      key: 'ltv',
      label: 'LTV (Stabilized)',
      result: computedLtv == null ? 'na'
        : computedLtv <= PROGRAM_RULES.maxLtvStabilized ? 'pass' : 'fail',
      detail: computedLtv != null
        ? `${(computedLtv * 100).toFixed(1)}% (max ${PROGRAM_RULES.maxLtvStabilized * 100}%)`
        : 'No valuation provided',
    },
    {
      key: 'ltc',
      label: 'LTC',
      result: computedLtc == null ? 'na'
        : computedLtc <= PROGRAM_RULES.targetLtc ? 'pass' : 'fail',
      detail: computedLtc != null
        ? `${(computedLtc * 100).toFixed(1)}% (target ≤${PROGRAM_RULES.targetLtc * 100}%)`
        : 'No project cost provided',
    },
    {
      key: 'dscr',
      label: 'DSCR',
      result: computedDscr == null ? 'na'
        : computedDscr >= PROGRAM_RULES.minDscr ? 'pass' : 'fail',
      detail: computedDscr != null
        ? `${computedDscr.toFixed(2)}x (min ${PROGRAM_RULES.minDscr}x)`
        : 'Not applicable / no NOI',
    },
    {
      key: 'debt_yield',
      label: 'Debt Yield',
      result: computedDy == null ? 'na'
        : computedDy >= PROGRAM_RULES.minDebtYield ? 'pass' : 'fail',
      detail: computedDy != null
        ? `${(computedDy * 100).toFixed(1)}% (min ${PROGRAM_RULES.minDebtYield * 100}%)`
        : 'Not applicable / no NOI',
    },
    {
      key: 'liquidity',
      label: 'Borrower Liquidity',
      result: computedLiqOk == null ? 'na' : computedLiqOk ? 'pass' : 'fail',
      detail: computedLiqOk != null
        ? `≥ ${PROGRAM_RULES.minLiquidityPct * 100}% of loan post-closing`
        : 'Not provided',
    },
    {
      key: 'equity',
      label: 'Borrower Equity',
      result: computedEqOk == null ? 'na' : computedEqOk ? 'pass' : 'fail',
      detail: computedEqOk != null
        ? `≥ ${PROGRAM_RULES.minEquityPct * 100}% of stabilized value`
        : 'Not provided',
    },
    {
      key: 'anchor_points',
      label: 'Valuation Anchor Points',
      result: anchorPointCount >= PROGRAM_RULES.minAnchorPoints ? 'pass' : 'fail',
      detail: `${anchorPointCount} of ${PROGRAM_RULES.minAnchorPoints} required`,
    },
  ];

  const fails = rules.filter(r => r.result === 'fail');
  const deviations: string[] = fails.map(r => r.label);

  const decision = fails.length === 0
    ? 'Approved'
    : fails.some(r => ['ltv', 'anchor_points'].includes(r.key))
      ? 'Denied'
      : 'Suspended';

  return {
    loanId,
    ltv: computedLtv,
    ltc: computedLtc,
    dscr: computedDscr,
    debtYield: computedDy,
    liquidityOk: computedLiqOk,
    equityOk: computedEqOk,
    anchorPointCount,
    rules,
    decision,
    deviations,
  };
}

// ─── Per-loan scorecard inputs (seeded, realistic) ───────────────────────────

export function scorecardInputsForLoan(
  loanId: string,
  loanAmount: number,
  parcels: Parcel[],
  _loan: Loan,
): ScorecardInputs {
  const stabilizedValue = parcels.reduce((sum, p) => sum + (p.valuation ?? 0), 0) || undefined;
  const parcelState = parcels[0]?.state;

  // Seed realistic inputs per loan for demo fidelity
  const overrides: Record<string, Partial<ScorecardInputs>> = {
    'loan-1': { anchorPointCount: 2, postClosingLiquidity: loanAmount * 0.12 },
    'loan-2': { anchorPointCount: 3, postClosingLiquidity: loanAmount * 0.15, borrowerEquity: (stabilizedValue ?? loanAmount) * 0.35 },
    'loan-3': { anchorPointCount: 2, postClosingLiquidity: loanAmount * 0.18, borrowerEquity: (stabilizedValue ?? loanAmount) * 0.40 },
    'loan-4': { anchorPointCount: 3, noi: 140000, annualDebtService: loanAmount * 0.14, postClosingLiquidity: loanAmount * 0.11, borrowerEquity: (stabilizedValue ?? loanAmount) * 0.28 },
    'loan-5': { anchorPointCount: 2, postClosingLiquidity: loanAmount * 0.09, borrowerEquity: (stabilizedValue ?? loanAmount) * 0.18 },
    'loan-6': { anchorPointCount: 3, postClosingLiquidity: loanAmount * 0.14 },
    'loan-7': { anchorPointCount: 2, postClosingLiquidity: loanAmount * 0.16 },
  };

  return {
    loanAmount,
    stabilizedValue,
    parcelState,
    anchorPointCount: 0,
    ...overrides[loanId],
  };
}
