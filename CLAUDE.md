# Anchor Point Lending — Loan Pipeline Board

## Project overview
Trello-style loan pipeline board for Anchor Point Lending, a private/hard-money real estate lender. Built as a demo (mock data, no backend). Stack: Vite + React 18 + TypeScript + Tailwind CSS v4 + dnd-kit.

## Dev server
```bash
npm run dev        # start → http://localhost:5173
pkill -f "vite"    # stop the server (kills all vite processes)
```
Or if you know the PID: `kill <PID>` (find it with `lsof -ti :5173`).
The server runs in the background when launched from Claude Code — `pkill -f "vite"` is the reliable one-liner to stop it.

## Architecture
Three-layer seam:
- **UI** (`src/components/`) — reads only through provider hooks, never imports services or seed directly
- **Service interface** (`src/services/LoanService.ts`) — frozen contract; swap `MockLoanService` for `ApiLoanService` to go to production
- **Mock data** (`src/services/MockLoanService.ts` + `src/data/`) — in-memory, seeded from `src/data/seed.ts`

Pure lib functions (no React, no service calls) live in `src/lib/`.

## Key files
| Path | Purpose |
|---|---|
| `src/types/index.ts` | All entity types — source of truth for the data model |
| `src/services/LoanService.ts` | Service interface (frozen contract) |
| `src/context/LoanServiceProvider.tsx` | Provider + all hooks: `useLoanService`, `useLoans`, `useSelectedLoan`, `useMessageTemplates`, `useExternalParties`, `useScorecard`, `useFileTree` |
| `src/data/stages.ts` | 8 stages with colors |
| `src/data/stageSteps.ts` | 53 SOP process steps with owner/action/severity/template metadata |
| `src/data/seed.ts` | 7–8 seed loans with entities, parcels, step statuses, comments, attachments |
| `src/data/messageTemplates.ts` | 11 verbatim SOP email/text templates |
| `src/data/externalParties.ts` | NSC, Titan Bank, law firm, title companies, inspector |
| `src/data/loanFolderCategories.ts` | Canonical 7-category folder structure |
| `src/lib/underwriting.ts` | Bridge Loan Program rules, scorecard builder, state risk buckets |
| `src/lib/dates.ts` | firstPaymentDate, nscSetupSendDate, dueActions |
| `src/lib/fileTree.ts` | Pure file tree builder (loan → category → file) |
| `src/components/shared/Toast.tsx` | Toast notification system (ToastProvider + useToast hook) |

## Guardrails
- Components import only from the provider/interface — never directly from MockLoanService or seed files
- New computed logic goes in `src/lib/` as pure functions
- Adding new service methods: update interface → MockLoanService → provider hook (in that order)
- `StageStep` is an alias for `ProcessStep` — use `ProcessStep` for new code
- Drag-and-drop never hard-blocks (except Phase 7 loud confirm for critical gates, which is still overridable)

## Stages
1. New Intake · 2. Active Processing · 3. Title & Closing · 4. Servicing Setup · 5. Collecting · 6. Special Servicing · 7. Foreclosure · 8. Completed / Paid Off

## Seed loans
- loan-1: Bill Twyford — stage-1 (New Intake)
- loan-2: Land to Sky Realty LLC — stage-3 (Title & Closing)
- loan-3: Thomas Kemper (3 parcels) — stage-3
- loan-4: OH9 Holdings LLC — stage-6 (Special Servicing, draw program)
- loan-5: CR LJFB LLC — stage-6
- loan-6: Wabash Crossing — stage-7 (Foreclosure)
- loan-7: Ski Resort Chewelah — stage-7
- loan-8: Riverstone Capital LLC — stage-8 (Completed / Paid Off) ← added 2026-05-29

---

## Completed work (as of 2026-05-29)

### Board (Wave 1–2)
- 8-column Trello board with drag-and-drop (dnd-kit), optimistic stage moves
- Zoom controls (50–100%, Cmd+=/-, defaults 80%) so all 8 columns fit on screen
- Board / Files view toggle in header

### Detail panel (Phase 9)
- Slide-over with LoanSummary, StageStepChecklist, StageSwitcher, CommentList, AttachmentList
- Each step shows ownerRole chip, actionType chip, desiredOutcome
- Email/text steps: "Preview & Send" → pre-filled template → "Mark as Sent" → step done + comment logged
- `await_third_party` steps: "Waiting on {party}" card with contact info
- Critical steps (Wiring Instructions, Final Closing Checklist): red styling + banner
- Underwriting steps: scorecard inline (LTV/LTC/DSCR/debt-yield, Approved/Suspended/Denied)
- Draw/Extension sub-workflows: collapsible groups in Special Servicing
- Due-actions banner for Collecting/Special Servicing loans

### Critical gates (Phase 7)
- Dragging a Title & Closing loan past stage-4 checks for unmet critical steps
- Red confirm dialog listing unmet gates; override auto-logs a comment
- LoanCard shows red "N critical gate(s) unmet" badge for Title & Closing loans

### Files Explorer
- Board/Files toggle in header
- Two-pane: collapsible loan → category → file tree (left) + folder contents (right)
- Status rollup chips (verified/total, color-coded) on every folder
- File metadata panel with mock preview (image placeholder for jpg/png, doc placeholder for pdf)
- Search/filter, show-empty toggle, "Add file (mock)" button
- "Open in Files" link from detail panel AttachmentList

### Data / SOP
- 8 stages, 53 process steps with full SOP metadata (owner, action type, desired outcome, template, external party, severity, sub-workflow)
- 11 verbatim email/text templates with merge-field substitution
- 6 external parties (NSC, Titan Bank, law firm, title cos, inspector)
- Bridge Loan Program underwriting rules + scorecard (LTV/LTC/DSCR/debt-yield/liquidity/equity/anchor points)
- State foreclosure risk buckets (35 lending states)
- Date helpers: firstPaymentDate, NSC setup send date, due-action schedule

### Session 2026-05-29 (5 items)
- **LoanCard step progress refresh after stage move** — added `effectiveStageId` prop to LoanCard; Board passes `stageOverrides.get(loan.id) ?? loan.stageId` through StageColumn so the progress bar and step counts update immediately after drag, before the provider re-fetches.
- **Stage-8 (Completed) visual treatment** — column bg darkened to `#1d2125`, header uses italic text + checkmark icon prefix, count badge uses muted green instead of stage color.
- **Stage-level metrics in column header** — total portfolio value (e.g. "$1.3M total") shown below stage name when loans are present; formatted with M/k suffixes.
- **New Loan form** — "+ New Loan" button in BoardHeader opens a modal (display label, loan amount, lending entity select). `createLoan()` added to LoanService interface + MockLoanService. Provider gains `refreshLoans()`. Toast fires on creation. New loans land in stage-1.
- **Toast notification system** — `ToastProvider` wraps the app; `useToast()` hook fires success/warning/info toasts (auto-dismiss 3s, bottom-right). Wired into "Mark as Sent" (success) and drag override (warning).

### Session 2026-05-29 (3 items — keyboard nav, comment reply, scorecard sidebar)
- **Keyboard navigation on the board** — `ArrowLeft`/`ArrowRight` moves selection between stage columns (wrapping, skips empty columns); `ArrowUp`/`ArrowDown` moves between cards within the column; `Enter`/`Space` opens the detail panel; `Escape` clears selection or deselects keyboard focus. A dashed blue ring (`ring-2 ring-[#579dff]/30 ring-dashed`) distinguishes keyboard focus from click-selection. `keyboardFocusedLoanId` state lives in Board, passed via StageColumn → LoanCard. Only active when no modal/panel is open.
- **Comment reply / threading (lightweight)** — each comment now has a "Reply" link below Resolve/Unresolve. Clicking calls `onReply` with `@<INITIALS>: ` prefix. `CommentComposer` accepts `initialBody` + `onInitialBodyConsumed` props to pre-fill and auto-focus the textarea. `LoanDetailPanel` wires `replyPrefix` state between the two components. No nested thread UI — replies land flat in the list.
- **Scorecard sidebar button on column headers** — stage-1 and stage-2 column headers show a 📊 icon button. Clicking toggles a floating popover (positioned below the header) that lazy-loads all loan scorecards via `Promise.all(getScorecard)` and displays: decision breakdown (Approved / Suspended / Denied / Unknown counts), average LTV, and count of loans with LTV > 70%. Stats computed purely from the `loans` prop (`computedLtv`) for LTV and service calls for decisions.

---

## Future work (next sessions)

### Medium priority
- [ ] **Bulk actions** — select multiple loans, move to stage. Shift-click to range-select, then a floating action bar appears with "Move to stage" dropdown.
- [ ] **Files view: drag to upload mock** — drag a file onto a category folder to create a mock attachment entry (HTML5 drag events, no real upload).
- [ ] **Print / PDF view** — `window.print()` with a print-specific CSS stylesheet; printable loan summary sheet showing all key fields, step statuses, comments.
- [ ] **Payoff approval template body** — drafted placeholder exists; fill in final wording once team confirms.

### Nice to have
- [ ] **Dark/light mode toggle** — currently dark-only. Would need a `theme` context and CSS variable swaps.
- [ ] **LTV trend sparkline** — small chart on the loan card showing LTV change if the loan had prior valuations logged.
- [ ] **Notification bell** — aggregate "actions due" count across all loans, surfaced in the header.
