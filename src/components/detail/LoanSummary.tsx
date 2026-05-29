import type { Loan, BorrowerEntity, Principal, Parcel } from '../../types';

interface LoanSummaryProps {
  loan: Loan;
  borrowerEntity: BorrowerEntity;
  principal: Principal;
  parcels: Parcel[];
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface GridItemProps {
  label: string;
  value: string;
}

function GridItem({ label, value }: GridItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#7a8899]">{label}</span>
      <span className="text-sm text-[#e8ecf0]">{value}</span>
    </div>
  );
}

export function LoanSummary({ loan, borrowerEntity, principal, parcels }: LoanSummaryProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Title row */}
      <div className="flex items-start gap-2">
        <h2 className="text-base font-bold text-[#e8ecf0] flex-1 leading-snug">
          {loan.displayLabel}
        </h2>
        <span
          className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded ${
            loan.lendingEntity === 'APL'
              ? 'bg-[#579dff]/20 text-[#579dff] border border-[#579dff]/40'
              : 'bg-[#9f8fef]/20 text-[#9f8fef] border border-[#9f8fef]/40'
          }`}
        >
          {loan.lendingEntity}
        </span>
      </div>

      {/* Auto-pay chip */}
      <div>
        {loan.autoPayEnabled ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
            Auto Pay On
          </span>
        ) : (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#3d4b5c] text-[#7a8899]">
            Auto Pay Off
          </span>
        )}
      </div>

      {/* Grid: financials */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <GridItem label="Loan Amount"      value={fmt(loan.loanAmount)} />
        <GridItem label="Current Balance"  value={fmt(loan.currentBalance)} />
        <GridItem label="Interest Rate"    value={`${(loan.interestRate * 100).toFixed(2)}%`} />
        <GridItem label="Payment Due Day"  value={`${loan.paymentDueDay}${loan.paymentDueDay === 1 ? 'st' : 'th'} of Month`} />
        <GridItem label="Servicer"         value={loan.servicer} />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <GridItem label="Origination"    value={fmtDate(loan.originationDate)} />
        <GridItem label="Closing"        value={fmtDate(loan.closingDate)} />
        <GridItem label="Funded"         value={fmtDate(loan.fundedDate)} />
        <GridItem label="First Payment"  value={fmtDate(loan.firstPaymentDate)} />
      </div>

      {/* Borrower + Principal */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-[#7a8899]">Borrower</p>
        <p className="text-sm text-[#e8ecf0]">
          {borrowerEntity.name}
          <span className="ml-1.5 text-xs text-[#7a8899]">({borrowerEntity.type})</span>
        </p>
        <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mt-2">Principal</p>
        <p className="text-sm text-[#e8ecf0]">
          {principal.firstName} {principal.lastName}
        </p>
        <p className="text-xs text-[#7a8899]">{principal.email}</p>
        <p className="text-xs text-[#7a8899]">{principal.phone}</p>
      </div>

      {/* Parcels */}
      {parcels.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-[#7a8899]">
            Parcels ({parcels.length})
          </p>
          <ul className="space-y-1">
            {parcels.map((p) => (
              <li key={p.id} className="text-xs text-[#b6c2cf] leading-snug">
                {p.addressLine}, {p.city}, {p.state} — {p.propertyType}
                {p.acreage !== null ? ` — ${p.acreage}ac` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
