import type { Loan } from '../../types';

const SERVICING_STAGES = new Set(['stage-4', 'stage-5', 'stage-6']);

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nextPaymentDates(firstPaymentIso: string, count: number): string[] {
  const d = new Date(firstPaymentIso);
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + i);
    dates.push(nd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  return dates;
}

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 10) return '10th';
  if (n === 20) return '20th';
  return `${n}th`;
}

interface PaymentCalendarProps {
  loan: Loan;
}

export function PaymentCalendar({ loan }: PaymentCalendarProps) {
  if (!SERVICING_STAGES.has(loan.stageId) || !loan.firstPaymentDate) return null;

  const upcoming = nextPaymentDates(loan.firstPaymentDate, 3);

  const statusLabel =
    loan.stageId === 'stage-6' ? { text: 'Delinquent',       cls: 'bg-red-500/20 text-red-400 border-red-500/30' } :
    loan.stageId === 'stage-5' && loan.autoPayEnabled ? { text: 'Auto Pay Active', cls: 'bg-green-500/20 text-green-400 border-green-500/30' } :
    loan.stageId === 'stage-5' ? { text: 'Manual',           cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' } :
    { text: 'Setting Up', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };

  return (
    <div className="mx-4 mb-1 mt-3 bg-[#1d2125] rounded-md border border-[#3d4b5c] p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-[#7a8899]">
            <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-semibold text-[#b6c2cf]">Payment Schedule</span>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${statusLabel.cls}`}>
          {statusLabel.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mb-0.5">First Payment</p>
          <p className="text-[#e8ecf0] font-medium">{fmtDate(loan.firstPaymentDate)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mb-0.5">Due Day</p>
          <p className="text-[#e8ecf0] font-medium">{ordinal(loan.paymentDueDay)} of month</p>
        </div>
      </div>

      <div className="mt-2.5">
        <p className="text-[10px] uppercase tracking-wider text-[#7a8899] mb-1">Upcoming Payments</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {upcoming.map((d, i) => (
            <span key={i} className="text-[11px] text-[#b6c2cf] bg-[#282e33] px-2 py-0.5 rounded border border-[#3d4b5c]">
              {d}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-2.5 text-[10px] text-[#5d6f7e]">
        NSC: (800) 646-3445 · office@noteservicingcenter.com
      </p>
    </div>
  );
}
