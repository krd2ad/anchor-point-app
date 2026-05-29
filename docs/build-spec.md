# Anchor Point Lending — Loan Pipeline Board
## Build Specification (Demo v1)

---

## 1. Scope

A Trello-style board for managing private/hard-money real estate loans through seven stages. Each **loan is a single data-backed entity occupying exactly one stage at a time**. The numbered items currently sitting in your Trello columns become a **fixed per-stage checklist** rendered *inside* each loan — not separate cards.

**In scope (v1, demo):**
- Seven-column board, loans rendered as cards in their current stage.
- Drag-and-drop a loan to any stage. Never blocks, even with incomplete steps.
- Loan detail view: opens to current-stage checklist, lets you jump to view any other stage's data/steps for that loan.
- Per-stage checklist items, toggleable (done / not done / N-A).
- Comments on the loan, tagged with the stage they were made in, resolvable.
- Mock attachments (named placeholder slots, no real upload).
- Mock data seeded from JSON matching the production schema.

**Explicitly out of scope (v1):**
- Real backend, auth, file upload pipeline.
- Automated stage transitions (e.g., late-payment buckets advancing on their own).
- Role-based approval gating (the "Rivers to Approve" gates are represented as ordinary checklist steps, not enforced).
- Editing/reordering stage steps in the UI (steps are fixed/seeded).

---

## 2. Architecture

Three layers with a hard seam between UI and data. The mock store is the only thing replaced for production.

```
┌─────────────────────────────────────────────┐
│  UI LAYER (React + TS + Tailwind)            │
│  Board · LoanCard · LoanDetail · dnd-kit     │
└───────────────────┬─────────────────────────┘
                    │  calls only the interface
┌───────────────────▼─────────────────────────┐
│  SERVICE INTERFACE  (LoanService)            │
│  getLoans, moveLoanToStage, toggleStep,      │
│  addComment, resolveComment, ...             │
└───────────────────┬─────────────────────────┘
        ┌───────────┴────────────┐
┌───────▼─────────┐    ┌─────────▼──────────────┐
│ MockLoanService │    │ ApiLoanService (later) │
│ in-memory +     │    │ REST / Supabase         │
│ JSON seed       │    │ same interface          │
└─────────────────┘    └────────────────────────┘
```

The UI imports the `LoanService` **interface**, never a concrete store. Swapping `MockLoanService` for `ApiLoanService` in one provider is the entire path to production data.

---

## 3. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | |
| Build | Vite | fast, simple |
| Styling | Tailwind CSS | matches the dense, dark Trello look |
| Drag & drop | `dnd-kit` | accessible, maintained, good for columns |
| State | React Context + reducer | wraps the active `LoanService` |
| IDs / dates | `nanoid`, native `Date` / ISO strings | |
| Hosting | Vercel or Netlify | static; no backend needed for demo |

Web-only, responsive down to tablet width.

---

## 4. Data model

This schema is the source of truth — production builds against it; the seed JSON is a preview of real rows. Types are illustrative TS.

### Loan
| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `stageId` | string | current stage; the only field drag-and-drop changes |
| `lendingEntity` | `'APL' \| 'APG'` | confirm meaning of APG vs APL |
| `borrowerEntityId` | string | → BorrowerEntity |
| `principalId` | string | → Principal (the human/guarantor) |
| `parcelIds` | string[] | → Parcel (one or many) |
| `loanAmount` | number | |
| `currentBalance` | number | |
| `interestRate` | number | adjustable on default |
| `servicer` | string | e.g., "NSC" |
| `originationDate` | string (ISO) \| null | |
| `closingDate` | string (ISO) \| null | |
| `fundedDate` | string (ISO) \| null | |
| `firstPaymentDate` | string (ISO) \| null | |
| `paymentDueDay` | `1 \| 10 \| 20` | per NSC account setup |
| `autoPayEnabled` | boolean | |
| `displayLabel` | string | e.g., "Bill Twyford – 416 South 1st St…" |
| `createdAt` / `updatedAt` | string (ISO) | |

### BorrowerEntity  (the LLC / business)
`id`, `name` (e.g., "Land to Sky Realty LLC"), `type` (`'LLC' \| 'Individual' \| 'Corp' \| 'Trust'`), `ein` (string \| null).

### Principal  (the person / guarantor)
`id`, `firstName`, `lastName`, `email`, `phone`, `idType` (`'DriversLicense' \| 'Passport' \| 'Other'`), `idNumber`, `idImageAttachmentId` (string \| null).

> A loan like "Land to Sky Realty LLC (Deric Outley)" = BorrowerEntity + Principal.

### Parcel  (collateral — many per loan)
`id`, `addressLine`, `city`, `state`, `acreage` (number \| null), `propertyType` (`'Land' \| 'SFR' \| 'Commercial' \| 'Other'`), `valuation` (number \| null).

> "Thomas Kemper – 3 Parcels" = one loan, three Parcel rows.

### Stage
`id`, `order` (1–7), `name`, `color`. Seven fixed rows (see §7).

### StageStep  (fixed checklist template)
`id`, `stageId`, `order`, `label`. Seeded from the board (see §7). Not user-editable in v1.

### LoanStepStatus  (loan × step)
`id`, `loanId`, `stepId`, `status` (`'done' \| 'not_done' \| 'na'`), `completedBy` (userId \| null), `completedAt` (ISO \| null). This is what powers the per-loan checklist.

### Comment
`id`, `loanId`, `stageId` (the stage it was written in — the tag), `authorId`, `body`, `resolved` (boolean), `createdAt`.

### Attachment  (mock in v1)
`id`, `loanId`, `name`, `kind` (`'ID' \| 'Deed' \| 'TermSheet' \| 'Settlement' \| 'Other'`), `status` (`'requested' \| 'received' \| 'verified'`). No file bytes yet.

### User  (lightweight)
`id`, `initials`, `name`, `color`. For comment authorship + the avatar row.

---

## 5. Service interface

```ts
interface LoanService {
  // reads
  getStages(): Promise<Stage[]>;
  getStageSteps(stageId: string): Promise<StageStep[]>;
  getLoans(): Promise<Loan[]>;
  getLoan(loanId: string): Promise<LoanDetail>;        // loan + entity + principal + parcels + statuses + comments + attachments
  getStepStatuses(loanId: string): Promise<LoanStepStatus[]>;

  // mutations
  moveLoanToStage(loanId: string, stageId: string): Promise<Loan>;   // never throws on incomplete steps
  setStepStatus(loanId: string, stepId: string, status: StepStatus): Promise<LoanStepStatus>;
  addComment(loanId: string, stageId: string, body: string): Promise<Comment>;
  resolveComment(commentId: string): Promise<Comment>;
  unresolveComment(commentId: string): Promise<Comment>;
}
```

`MockLoanService` implements this over an in-memory object seeded from JSON. Production implements the identical signature over the real API.

---

## 6. Component tree

```
<App>
 └ <LoanServiceProvider>            // injects active service + holds state
    └ <Board>
       ├ <BoardHeader>              // title, avatar row (mock users)
       ├ <DndContext>               // dnd-kit
       │  └ <StageColumn> ×7
       │     ├ <StageColumnHeader>  // name + loan count
       │     └ <LoanCard> ×n        // displayLabel, amount, mini step progress
       └ <LoanDetailPanel>          // slide-over; opens on card click
          ├ <LoanSummary>           // entity, principal, parcels, amounts, dates
          ├ <StageStepChecklist>    // current stage's steps, toggleable
          ├ <StageSwitcher>         // view any other stage's steps for this loan
          ├ <CommentList>           // grouped/sortable by stage; resolve toggle
          │  └ <CommentComposer>    // posts with current stage tag
          └ <AttachmentList>        // mock slots
```

---

## 7. Seeded stages & steps (transcribed from the board)

The named/people cards from the board are **loan instances** (they become seed Loans, see §9). Below are the **fixed process steps** per stage.

**1 — Loan Funnel**
1. Draft Loan Card
2. Rough Underwriting of Collateral
3. Ready to Generate Term Sheet
4. Send Conditional Term Sheet (pre-underwriting)

**2 — Processing / Underwriting**
1. Request Underwriting Document Package
2. (1a) Kick off Draw Program
3. Underwriting of Collateral and Borrower
4. (2A) Loan Folder QC and Sign-off, Loan Card Standardization QC
5. Ready for Loan Docs
6. Draw Program Approved

**3 — Title & Closing**
1. Title Opened
2. Title Issues Pending
3. Loan Docs Drafting
4. Wiring Instructions Verified
5. Settlement Statement Review
6. Final Closing Checklist Completed
7. (6A) Loan Folder QC for complete information package and portfolio update
8. Ready to Fund
9. Funded (awaiting…)

**4 — Servicing Setup**
1. Funded — Ready to Submit to Servicing
2. Service Information Input (Rivers to approve)
3. Submitted to Servicing (wait for NSC to confirm)
4. Final Document Package Check in NSC System (Rivers to approve)
5. Receive DOT from Title and Update to NSC

**5 — Collecting**
1. NSC Account Set Up (due 1st / 10th / 20th of the closing month)
2. Auto Pay Set Up
3. (1A) Set Up — Waiting for First Payment
4. (1B) First Payment Late (0–10 days)
5. (1C) First Payment Late (11–20 days)
6. Collecting / Performing

**6 — Special Servicing**
1. (1A) Late Payment — Personal Contact (10 day)
2. (1B2) After 20 Days — Move to Default (adjust interest rate with NSC)
3. (1C) After 30 Days — Email Borrower & Demand Letter from Law Firm
4. (2A) Draw Requested

**7 — Foreclosure**
1. Foreclosure Law Firm Engagement Period
2. Default Notice Sent
3. Collateral Protection Needed?

> Verify this transcription against the live board before locking — a couple of cards in the screenshot were partially cut off (e.g., the Funded/awaiting label, and Collecting's email-update note).

---

## 8. Behavior details

**Drag-and-drop.** Dropping a loan in a new column calls `moveLoanToStage`. It always succeeds. No confirmation, no block, regardless of step completion. (A non-blocking visual hint — "3 of 6 steps incomplete" — is a nice-to-have, not a gate.)

**Loan detail view.** Opens to the loan's **current stage** with that stage's checklist shown first. `StageSwitcher` lets you view steps and step-statuses for any other stage *without moving the loan*. The summary (entity, principal, parcels, terms) is always visible.

**Checklist.** Each step toggles done / not-done / N-A via `setStepStatus`. Card shows a small progress indicator for the current stage.

**Comments.** Posted from the detail view; automatically tagged with the loan's current stage at time of writing. List shows the stage tag on each comment, supports resolve/unresolve, and can be grouped or sorted by stage. Comments persist across stage moves.

**Attachments.** Mock slots with a name, kind, and status chip. No upload; clicking does nothing destructive in v1.

---

## 9. Seed data plan

Convert the named cards into real seed Loans so the demo looks live on first load:

- **Bill Twyford** — 416 South 1st St, Clinton IA — APL — $75k → Loan Funnel
- **Land to Sky Realty LLC (Deric Outley)** — 60 Acres, Port Arthur TX — APL — $150k → Title & Closing (the EMD 5/28 card)
- **Thomas Kemper** — 3 Parcels, Port Arthur TX — APG — 160k → Title & Closing (one loan, three Parcel rows)
- **OH9 Holdings LLC** — 1923 County Rd 202, Caldwell TX — APL — $1,305k → Special Servicing
- **CR – LJFB LLC** — 23A-51-A552 Stoney Mountain Rd, Jim Thorpe PA — $260k → Special Servicing
- Plus the Foreclosure-stage parcels (Wabash Crossing, Springfield IL; Ski Resort, Chewelah).

Each seed loan gets a BorrowerEntity, a Principal, one or more Parcels, a set of LoanStepStatus rows (mostly done for late-stage loans, partial for early-stage), a couple of stage-tagged comments (one resolved, one open), and 2–3 mock attachments. Seed 4–6 mock Users for authorship and the avatar row.

---

## 10. Open items

1. **Assignees / approval roles.** v1 plan: lightweight `User` for comment authorship + avatars only; the "Rivers to approve" gates are ordinary (non-enforcing) checklist steps. Confirm, or add an explicit assignee/approver field on the loan now.
2. **Acronym glossary** (affects labels only, not architecture): confirm **CR**, **APL vs APG**, and the **"L2-" prefix**. NSC = servicer, DOT = deed of trust, EMD = earnest money deposit are confirmed.
3. **Board transcription** — verify §7 against the live board for the cut-off cards.

---

## 11. Production swap notes (for later)

- Replace `MockLoanService` with `ApiLoanService`; UI untouched.
- Each schema entity → a table; `LoanStepStatus` and `Comment` are the high-write tables.
- Attachments graduate to real object storage (S3/Supabase Storage) — `Attachment` already carries the metadata; add a `url`/`storageKey`.
- Add auth, then real `User` records (the demo's user shape is forward-compatible).
- If/when automation is wanted, stage transitions and late-payment buckets become server-side jobs writing the same `stageId` field the UI already drives manually.
