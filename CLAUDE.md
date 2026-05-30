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

### Session 2026-05-29 (bulk selection)
- **Bulk actions** — shift-click any loan card toggles it into/out of a bulk selection set (`selectedLoanIds: Set<string>` in Board). A fixed floating action bar slides up from the bottom when any loans are selected, showing a count, a "Move to stage" dropdown (all 8 stages), and a "Clear" button. On stage select, all selected loans are moved via `service.moveLoanToStage`, `stageOverrides` updated, selection cleared, and a success toast fires. Normal click (no shift) clears bulk selection and opens the detail panel as usual. Teal ring (`ring-2 ring-[#4bce97]/60`) on bulk-selected cards.

### Session 2026-05-29 (Cmd+K search + risk score)
- **Cmd+K global loan search (spotlight-style)** — `CommandPaletteProvider` + `useCommandPalette()` hook in `src/context/CommandPaletteContext.tsx`. `CommandPalette` component (`src/components/shared/CommandPalette.tsx`) is always mounted in AppShell (App.tsx). Opens on Cmd+K / Ctrl+K via a global keydown listener. Autofocused search input filters loans by displayLabel, amount string, or principal name (case-insensitive). Results show stage color dot, bold label, amount, stage name, LTV%; max 8 results. Arrow keys navigate, Enter selects (calls `onNavigateToLoan` → `selectLoan` + switches to board view), Escape closes. Empty query shows all loans sorted by stage order. Backdrop click closes. Footer shows keyboard hint bar + result count. A small "⌘K" search button was added to BoardHeader (between the new-loan button and the bell), wired via `onOpenCommandPalette` prop from Board.tsx.
- **Loan risk score on cards** — Pure function `loanRiskScore(loan)` in `src/lib/riskScore.ts` — no service calls, computed from `computedLtv`, `stageId`, `loanAmount`, `autoPayEnabled`. Returns `{ level: RiskLevel, score: number, reasons: string[] }`. LoanCard imports it and renders a colored dot (top-right corner, inside top row): critical = pulsing red (`bg-red-500 animate-pulse`), high = orange (`bg-orange-400`), medium = yellow (`bg-yellow-400`), low = no dot. Dot has a `title` attribute listing the reasons.

### Session 2026-05-30 (stage history, loan notes, starred watchlist)
- **Stage-change history log** — `StageChangeEvent` type in `src/types/index.ts`. `getStageHistory(loanId)` added to `LoanService` interface + `MockLoanService`. `SEED_STAGE_HISTORY` in `src/data/seed.ts`: plausible transitions for loans 4–8. `moveLoanToStage` now appends a new `StageChangeEvent`. `ActivityTimeline` accepts optional `stageHistory` prop and renders 🔀 "Moved from [stage] → [stage]" events with a purple dot. `LoanDetailPanel` fetches history in parallel with `getLoan` and passes it to `ActivityTimeline`.
- **Loan notes (free-form sticky)** — `LoanNote` type in `src/types/index.ts`. `getNote`/`saveNote` added to service interface + mock (seed note for loan-4: OH9 Holdings unresponsive borrower). `src/components/detail/LoanNote.tsx`: auto-resizing textarea, placeholder italic/muted, debounced auto-save on change (300ms) + immediate save on blur, "Saved" indicator for 2s. Mounted in `LoanDetailPanel` between StageStepChecklist and StageSwitcher (Dividers on each side).
- **Watchlist / starred loans** — `isStarred?: boolean` added to `Loan` type. `toggleStar(loanId)` added to service interface + mock. `LoanCard` shows a star button (☆/★) in the top-right of the label row; gold when active, muted when not; uses `group` class for hover visibility; accepts `isStarred` prop override + `onStarToggled` callback. `StageColumn` sorts starred loans to top within each column and passes `starOverrides` + `onStarToggled` down. `Board` maintains `starOverrides: Map<string, boolean>` for optimistic updates; calls `refreshLoans()` after toggle so provider stays in sync. `CommandPalette` shows a "⭐ Starred" section at the top of results when starred loans exist, regardless of search query. `LoanDetailPanel` header shows a star button next to the close button.

### Session 2026-05-30 (quick-move, overdue indicator, stage journey)
- **Quick-move button on loan cards** — hover-visible action strip at the bottom of each card (opacity-0 → group-hover:opacity-100). Shows "→ Next stage" button for non-completed loans; calls `service.moveLoanToStage` then `onMovedToStage` callback. `onMovedToStage` prop added to `LoanCard`, passed through `StageColumn`, and wired in `Board.tsx` to update `stageOverrides` + fire a success toast. Card outer div now has `relative group` classes.
- **Overdue payment indicator** — amber pulsing dot (`w-2 h-2 bg-amber-400 animate-pulse absolute top-2 right-2`) on cards where `dueActions(activeStageId, firstPaymentDate, today)` returns at least one action (stage-5 with overdue payments, or stage-6 loans). Computed inline in `LoanCard` using `dueActions` from `src/lib/dates`. Not shown on drag overlays.
- **Stage journey visualization** — `src/components/detail/StageJourney.tsx`: 8-segment flex progress bar showing past (stage-color at 60% opacity), current (full stage color + caret), and future (muted #2d3748) stages. Current stage name + days-in-stage (color-coded grey/yellow/orange) shown below. Past stages determined by `stage.order < currentOrder` OR appearance in `stageHistory.fromStageId`. Mounted in `LoanDetailPanel` just above `ActivityTimeline` with a `Divider` on each side.

### Session 2026-05-30 (column collapse, docs indicator, loan navigation)
- **Board column collapse/expand** — `StageColumn` gains `collapsed` + `onToggleCollapse` props. Collapsed state: `min-w-[48px] max-w-[48px]`, stage color left border, rotated stage name (`writing-mode: vertical-rl`), count badge, expand chevron. Expanded state: normal 260px with a collapse chevron (‹) left of the count badge. `Board` adds `collapsedStages: Set<string>` state + `handleToggleCollapse` / `handleCollapseAll`. "Collapse all / Expand all" pill button in the filter bar row (right-aligned). Transitions use `duration-200`.
- **Document checklist completion in health strip** — `LoanHealthStrip` imports `useFileTree` and filters `attachments` to the current loan. Shows "Docs X/Y" at the right end of the strip. Color: green if all verified, amber if any requested, blue otherwise. `LoanHealthStrip` is now mounted in `LoanDetailPanel` just after the header (was previously defined but never rendered).
- **Prev/Next loan navigation in detail panel** — `LoanDetailPanel` calls `useLoans()` to get the full sorted loan list (by stage order then displayLabel). Header shows ‹ / N/M / › buttons between the title and the star button. ‹/› disabled at start/end of list. Clicking calls `selectLoan()` to navigate.

### Session 2026-05-30 (interest accrual, summary sheet, keyboard shortcuts modal)
- **Interest Accrual Tracker in LoanSummary** — `InterestAccruedItem` and `MaturityDateItem` sub-components added inside `LoanSummary.tsx`. `InterestAccruedItem` only renders for funded loans (`loan.fundedDate` set); computes daily interest = `(balance × rate/100) / 365`, multiplied by days since funding; displayed in amber/yellow. `MaturityDateItem` shows `closingDate + 12 months` formatted as "MMM YYYY"; value turns red when within 60 days.
- **Loan timeline export (per-loan summary sheet)** — `src/components/detail/LoanSummarySheet.tsx`: print-ready modal (`bg-white`, `text-gray-900`, `print-view` class, `max-w-2xl`). Sections: branded header + generated date, loan details 2-col grid, stage journey from `stageHistory`, checklist progress per stage (steps done/total with progress bars), last 5 comments. "Print" button calls `window.print()`. "Close" / Esc / backdrop close. Wired in `LoanDetailPanel.tsx`: `showSummarySheet` state + document-icon button in header controls row (between star and close buttons); rendered above the overlay so it's above the z-stack.
- **Keyboard shortcuts help modal** — `src/components/shared/KeyboardShortcutsModal.tsx`: dark modal (`bg-[#22272b]`, `border border-[#3d4b5c]`, `rounded-xl`, `max-w-lg`). Four sections: Navigation, Zoom, Board, Detail Panel. Each row: key chip(s) (`bg-[#1d2125]`, `border border-[#3d4b5c]`, monospace, `rounded`, `px-2 py-0.5`, `text-xs`) + description. Esc / backdrop close. `onShowShortcuts` prop added to `BoardHeader` + a `?` icon button added (right side, before avatars). `showShortcuts` state in `Board.tsx`; `?` keydown handler added to board keyboard effect (fires only when no input focused, no other modal open). Modal rendered at end of Board.tsx return.

### Session 2026-05-30 (pipeline velocity, underwriting widget, APL/APG split)
- **Pipeline Velocity section in Analytics** — `PipelineVelocity` component (inline in `AnalyticsView.tsx`) added between Risk Breakdown and the Loan Table. For each stage 1–7, computes average days loans have spent there using `Math.floor((Date.now() - new Date(loan.updatedAt).getTime()) / 86400000)`. Renders a horizontal bar chart: stage name on left, bar proportional to average vs. max average (stage color at ~60% opacity), "Xd avg" on right. Shows "—" if no loans in stage. Same dark card panel style as other analytics sections.
- **Underwriting Quick View widget** — `src/components/detail/UnderwritingWidget.tsx` (new file). Props: `loanId: string`. Calls `useLoanService().getScorecard(loanId)` on mount; shows spinner while loading and "Not yet computed" if null. When loaded: decision badge (Approved/Suspended/Denied/Pending) prominently colored, 4-metric 2×2 grid (LTV%, LTC%, DSCR, Debt Yield — "N/A" if null), anchor point count with pass/fail, deviations as red warning chips. Mounted in `LoanDetailPanel.tsx` between LoanNote and StageSwitcher (with Dividers) only when `stageId === 'stage-1'` or `'stage-2'`.
- **APL/APG entity split pills in PortfolioBar** — Two colored pills (APL blue `#579dff`, APG purple `#9f8fef`) show "$X.XM (N loans)" for each entity. Also added **portfolio health score** (0-100): starts at 100, -20 per critical-risk loan, -10 per high-risk loan, -5 per LTV>70% loan, +5 per completed loan; clamped 0-100. Shown as "Health: XX/100" with color (green ≥80, yellow 60-79, red <60). Imports `loanRiskScore` from `../../lib/riskScore`.

### Session 2026-05-30 (filter bar, days badge, compare modal)
- **Board quick-filter bar** — `src/components/board/FilterBar.tsx` with `BoardFilters` type (exported). Pill buttons: "APL only", "APG only", "Medium+ Risk", "High+ Risk", "Critical Risk", "Unmet Gates". Active pills show filled color (blue=entity, yellow/orange/red=risk, red=gates). "Filters active" + "× Clear filters" appear when any filter is on. Mounted in Board.tsx between PortfolioBar and the DndContext columns (board view only). Filters applied per-stage after building stageLoans: entity compares `lendingEntity`, risk uses `loanRiskScore(loan).level`, hasUnmetGates restricts to stage-3. StageColumn receives `hiddenCount` prop; shows a yellow "N hidden" badge in the count area when nonzero.
- **Days-in-stage badge on loan cards** — `DaysInStageBadge` helper in `LoanCard.tsx` computes `Math.floor((Date.now() - new Date(loan.updatedAt)) / 86400000)`. Renders inline with the progress bar row: 0–7d muted grey, 8–30d yellow, 31+ orange. Not shown for stage-8 (completed) loans. Flex row now always renders (even with no progress steps) to give the badge a home.
- **Loan comparison modal** — `src/components/board/LoanCompareModal.tsx`. Props: `loanIds: string[]`, `onClose`. Fetches `getLoan` + `getScorecard` in parallel for each loan. Side-by-side table: 13 fields (Display Label, Stage, Amount, Current Balance, LTV%, Interest Rate, Servicer, Closing Date, Funded Date, Loan Position, Auto Pay, Risk Level, Scorecard Decision). Rows with differing values highlighted with `bg-[#2d3748]` + yellow dot. Backdrop click or Escape closes. BulkActionBar gains `onCompare?` prop + "Compare" button (visible when 2–4 loans selected, columns-icon). Board.tsx adds `showCompareModal` state and passes `onCompare` + `selectedLoanIds` through.

### Session 2026-05-29 (print view + drag-to-upload mock)
- **Print / PDF view** — "Print" button in BoardHeader (board view only, next to CSV). `PrintView` component (`src/components/board/PrintView.tsx`) is always in the DOM, hidden on screen, visible only via `@media print`. Print CSS in `src/styles/print.css` (imported in `main.tsx`): hides everything except `.print-view`, renders white background with a clean table of all loans (Display Label, Stage, Amount, LTV%, Interest Rate, Servicer, Closing Date, Funded Date). Clicking the Print button calls `window.print()`.
- **Files view: drag-to-upload mock** — HTML5 drag-and-drop on category folder rows (loan node view) and on the category content table (category node view). `dragOverCategory` state highlights the hovered folder row with dashed blue border (`border-[#579dff]/60 bg-[#579dff]/5`). The category content area also shows a centered "Drop to add file" overlay when a file is dragged over it. On drop, calls `onAddMock(loanId, category)` with filename from `event.dataTransfer.files[0]?.name` and fires a success toast via `useToast()`. File bytes are ignored (mock only).

### Session 2026-05-29 (portfolio bar, notification bell, dark/light toggle)
- **Global portfolio summary bar** — `src/components/board/PortfolioBar.tsx` mounts between BoardHeader and the DndContext columns (board view only). Shows in one compact row: total loan count, total portfolio value ($XM), active loan count, avg LTV% (color-coded green/yellow/red), LTV>70% count (red if >0), and a mini per-stage dot+count breakdown for stages 1–7.
- **Due-actions notification bell** — Bell icon button in BoardHeader (right side, before avatars). `dueActionsCount` and `dueActionItems` computed in Board.tsx via `dueActions()` from `src/lib/dates.ts` and passed as props. Red badge shows count when >0. Clicking opens a popover listing each loan's `displayLabel` + action reason string. Click-away closes it (useEffect on `document.mousedown`).
- **Dark/light mode toggle** — `src/context/ThemeContext.tsx` provides `theme` + `toggleTheme()`. On mount reads from `localStorage`; on toggle sets `document.documentElement.classList.toggle('light')` and persists. `ThemeProvider` wraps `<App>` in `main.tsx`. Sun/moon SVG button in BoardHeader receives `theme` + `onToggleTheme` props from Board.tsx and App.tsx. Light-mode CSS overrides in `src/index.css` using `:root.light` selector.

### Session 2026-05-30 (draw tracker, concentration risk, SLA indicator)
- **Draw Program tracker widget** — `src/components/detail/DrawProgramWidget.tsx`. Props: `loanId`, `loan`. Only renders when `loan.hasDrawProgram === true`. Fetches `getStageSteps('stage-6')` + `getStepStatuses(loanId)` on mount; filters to steps with `subWorkflow === 'draw'` (7 steps: 2A–2G). Header shows "Draw Program" + "N/7 complete" badge (green when all done, amber when partial, muted when none). Each step row: colored status dot (green=done, muted=not_done/na) + truncated label with strikethrough for done steps. "Track draw →" button fires an info toast. Mounted in `LoanDetailPanel.tsx` between PaymentCalendar and LoanSummary with a Divider after it (conditional on `hasDrawProgram`).
- **Concentration Risk section in Analytics** — `ConcentrationRisk` inline component in `AnalyticsView.tsx`, placed between PipelineVelocity and LoanTable. Computes three risks from the `loans` array: entity concentration (APL or APG >80% of portfolio value), stage concentration (>50% of active loans in one stage), single-loan concentration (>30% of total portfolio). Each flagged risk shows an amber-bordered warning card with triangle icon + human-readable message. If no risks: green "No concentration risks detected" chip.
- **Stage SLA overdue indicator** — `STAGE_SLA_DAYS` constant at top of `StageColumn.tsx` mapping each stage ID to expected max days (stage-5 and stage-8 = 0 = no SLA). `overdueLoans` computed from loans where days-since-updatedAt exceeds the SLA. Amber SVG clock icon added to expanded column header (between collapse button and count badge) when any loans are overdue and `slaDays > 0`. Tooltip: "N loan(s) past expected stage duration".

---

## Future work (next sessions)

### Medium priority
- [ ] **Payoff approval template body** — drafted placeholder exists; fill in final wording once team confirms.

### Nice to have
- [ ] **LTV trend sparkline** — small chart on the loan card showing LTV change if the loan had prior valuations logged.
