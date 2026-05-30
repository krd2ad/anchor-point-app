import type { Loan, BorrowerEntity, Principal, Parcel } from '../../types';
import { stateRiskBucket, type StateRiskBucket } from '../../lib/underwriting';
import { EXTERNAL_PARTIES } from '../../data/externalParties';
import { fmt, fmtDate, daysSince } from '../../lib/formatters';

interface LoanSummaryProps {
  loan: Loan;
  borrowerEntity: BorrowerEntity;
  principal: Principal;
  parcels: Parcel[];
}

function GridItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">{label}</span>
      <span className="text-sm text-[#e8ecf0]">{value}</span>
    </div>
  );
}

function InterestAccruedItem({ loan }: { loan: import('../../types').Loan }) {
  if (!loan.fundedDate) return null;
  const daysFunded = daysSince(loan.fundedDate);
  const dailyInterest = (loan.currentBalance * (loan.interestRate / 100)) / 365;
  const totalAccrued = dailyInterest * daysFunded;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">Interest Accrued</span>
      <span className="text-sm font-semibold text-[#f5cd47]">
        {totalAccrued.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
      </span>
      <span className="text-[10px] text-[#7a8899]">
        over {daysFunded} day{daysFunded !== 1 ? 's' : ''} at {loan.interestRate.toFixed(2)}%
      </span>
    </div>
  );
}

function MaturityDateItem({ closingDate }: { closingDate: string | null }) {
  if (!closingDate) return null;
  const closing = new Date(closingDate);
  const maturity = new Date(closing);
  maturity.setMonth(maturity.getMonth() + 12);
  const formatted = maturity.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const daysUntil = Math.floor((maturity.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isNear = daysUntil <= 60;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">Maturity Date</span>
      <span className={`text-sm font-semibold ${isNear ? 'text-[#f87168]' : 'text-[#e8ecf0]'}`}>
        {formatted}
      </span>
      {isNear && daysUntil >= 0 && (
        <span className="text-[10px] text-[#f87168]">{daysUntil}d remaining</span>
      )}
      {daysUntil < 0 && (
        <span className="text-[10px] text-[#f87168]">Past maturity</span>
      )}
    </div>
  );
}

const RISK_META: Record<StateRiskBucket, { label: string; color: string }> = {
  low:     { label: 'Low Fcl Risk',     color: '#4bce97' },
  medium:  { label: 'Med Fcl Risk',     color: '#f5cd47' },
  high:    { label: 'High Fcl Risk',    color: '#f87168' },
  unknown: { label: 'Unlicensed State', color: '#7a8899' },
};

function RiskBadge({ state }: { state: string }) {
  const bucket = stateRiskBucket(state);
  const m = RISK_META[bucket];
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{ color: m.color, backgroundColor: m.color + '22', border: `1px solid ${m.color}44` }}
    >
      {state} · {m.label}
    </span>
  );
}

export function LoanSummary({ loan, borrowerEntity, principal, parcels }: LoanSummaryProps) {
  const titleParty = loan.titleCompanyId
    ? EXTERNAL_PARTIES.find(p => p.id === loan.titleCompanyId)
    : null;

  return (
    <div className="p-4 space-y-4">
      {/* Title row */}
      <div className="flex items-start gap-2 flex-wrap">
        <h2 className="text-base font-bold text-[#e8ecf0] flex-1 leading-snug min-w-0">
          {loan.displayLabel}
        </h2>
        <span className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded bg-[#579dff]/20 text-[#579dff] border border-[#579dff]/40">
          APL
        </span>
      </div>

      {/* Chips row */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {loan.autoPayEnabled ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">Auto Pay On</span>
        ) : (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#3d4b5c] text-[#7a8899]">Auto Pay Off</span>
        )}
        {loan.loanPosition && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3d4b5c] text-[#b6c2cf]">{loan.loanPosition}</span>
        )}
        {loan.referralPartner && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3d4b5c] text-[#b6c2cf]">via {loan.referralPartner}</span>
        )}
      </div>

      {/* Financials */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <GridItem label="Loan Amount"     value={fmt(loan.loanAmount)} />
        <GridItem label="Current Balance" value={fmt(loan.currentBalance)} />
        <GridItem label="Interest Rate"   value={`${loan.interestRate.toFixed(2)}%`} />
        <GridItem label="Payment Due"     value={`${loan.paymentDueDay}${loan.paymentDueDay === 1 ? 'st' : 'th'} of Month`} />
        <GridItem label="Servicer"        value={loan.servicer} />
        {titleParty && <GridItem label="Title Co." value={titleParty.name} />}
        <InterestAccruedItem loan={loan} />
        <MaturityDateItem closingDate={loan.closingDate} />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <GridItem label="Origination"   value={fmtDate(loan.originationDate)} />
        <GridItem label="Closing"       value={fmtDate(loan.closingDate)} />
        <GridItem label="Funded"        value={fmtDate(loan.fundedDate)} />
        <GridItem label="First Payment" value={fmtDate(loan.firstPaymentDate)} />
      </div>

      {/* Borrower + Principal */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-[#7a8899]">Borrower Entity</p>
        <p className="text-sm text-[#e8ecf0]">
          {borrowerEntity.name}
          <span className="ml-1.5 text-xs text-[#7a8899]">({borrowerEntity.type})</span>
        </p>
        <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mt-2">Principal / Guarantor</p>
        <p className="text-sm text-[#e8ecf0]">{principal.firstName} {principal.lastName}</p>
        <p className="text-xs text-[#7a8899]">{principal.email}</p>
        <p className="text-xs text-[#7a8899]">{principal.phone}</p>
      </div>

      {/* Parcels */}
      {parcels.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8899]">Collateral ({parcels.length} Parcel{parcels.length > 1 ? 's' : ''})</p>
          <ul className="space-y-2">
            {parcels.map(p => (
              <li key={p.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm text-[#b6c2cf] leading-snug">
                    {p.addressLine}, {p.city}, {p.state}
                  </p>
                  <p className="text-xs text-[#7a8899]">
                    {p.propertyType}{p.acreage !== null ? ` · ${p.acreage}ac` : ''}
                    {p.valuation ? ` · ${fmt(p.valuation)}` : ''}
                  </p>
                </div>
                <RiskBadge state={p.state} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
