// ─── Date-driven servicing helpers (Phase 8) ──────────────────────────────────
// All functions are pure and take explicit date strings (no Date.now()).

/**
 * First payment date = 1st of the month after the first full month post-closing.
 * e.g. closing Jan 1 OR Jan 31 → first payment Mar 1.
 */
export function firstPaymentDate(closingDateIso: string): string {
  const d = new Date(closingDateIso);
  // Advance to the 1st of two months forward
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const targetMonth = month + 2; // skip the closing month AND the first partial month
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;
  return `${targetYear}-${String(normalizedMonth + 1).padStart(2, '0')}-01`;
}

/**
 * NSC setup send date + paymentDayOfMonth, based on closing date.
 * - Closed 21st–end of month → send on 1st of next month, payment due 1st
 * - Closed 1st–9th → send on 10th of same month, payment due 10th
 * - Closed 10th–20th → send on 20th, payment due 20th
 */
export function nscSetupSendDate(closingDateIso: string): { sendDate: string; paymentDayOfMonth: 1 | 10 | 20 } {
  const d = new Date(closingDateIso);
  const day = d.getDate();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-indexed for output

  if (day >= 21) {
    // Send on 1st of next month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return {
      sendDate: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
      paymentDayOfMonth: 1,
    };
  } else if (day <= 9) {
    return {
      sendDate: `${year}-${String(month).padStart(2, '0')}-10`,
      paymentDayOfMonth: 10,
    };
  } else {
    return {
      sendDate: `${year}-${String(month).padStart(2, '0')}-20`,
      paymentDayOfMonth: 20,
    };
  }
}

/**
 * Returns which Collecting/Special-Servicing communications are due on a given date.
 * todayIso = 'YYYY-MM-DD'
 */
export interface DueAction {
  stepId: string;
  label: string;
  templateId?: string;
  reason: string;
}

export function dueActions(
  loanStageId: string,
  firstPaymentDateIso: string | null,
  todayIso: string,
): DueAction[] {
  if (!firstPaymentDateIso) return [];
  const today = new Date(todayIso);
  const firstPayment = new Date(firstPaymentDateIso);
  const daysSinceFirstPayment = Math.floor(
    (today.getTime() - firstPayment.getTime()) / (1000 * 60 * 60 * 24),
  );

  const actions: DueAction[] = [];

  if (loanStageId === 'stage-5') {
    // Escalation schedule based on days since first payment missed
    if (daysSinceFirstPayment >= 10 && daysSinceFirstPayment < 15) {
      actions.push({ stepId: 's5-3', label: 'First Payment Late (0–10 Days)', templateId: 'late_10day', reason: '10-day late notice due today' });
    }
    if (daysSinceFirstPayment >= 15 && daysSinceFirstPayment <= 17) {
      actions.push({ stepId: 's5-4', label: 'First Payment Late Escalation 1', templateId: 'late_escalation_1', reason: '15th–17th escalation due' });
    }
    if (daysSinceFirstPayment >= 20 && daysSinceFirstPayment <= 21) {
      actions.push({ stepId: 's5-4', label: 'First Payment Late Escalation 2', templateId: 'late_escalation_2', reason: '20-day escalation due today' });
    }
  }

  if (loanStageId === 'stage-6') {
    if (daysSinceFirstPayment >= 20 && daysSinceFirstPayment < 22) {
      actions.push({ stepId: 's6-2', label: 'Move to Default (20+ days)', templateId: 'default_notice', reason: '20-day default threshold reached' });
    }
    if (daysSinceFirstPayment >= 30 && daysSinceFirstPayment < 32) {
      actions.push({ stepId: 's6-3', label: 'Demand Letter from Law Firm', templateId: 'demand_letter_request', reason: '30-day demand letter threshold reached' });
    }
    // Portfolio check at 10-day and 20-day thresholds since first payment
    if (daysSinceFirstPayment >= 10 && daysSinceFirstPayment < 11) {
      actions.push({ stepId: 's6-1', label: 'Portfolio Check Day', reason: 'Monthly portfolio check due (10-day threshold)' });
    }
    if (daysSinceFirstPayment >= 20 && daysSinceFirstPayment < 21) {
      actions.push({ stepId: 's6-1', label: 'Portfolio Check Day', reason: 'Monthly portfolio check due (20-day threshold)' });
    }
  }

  return actions;
}
