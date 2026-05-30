# Anchor Point Lending Board — Next Steps

## What Is "Demo" State Right Now

The app is a fully functional UI demo with no backend. Every piece of data is:

- **In-memory only** — seeded from `src/data/seed.ts` on page load, reset on every refresh.
- **Mock service** — `MockLoanService` implements the full `LoanService` interface but stores everything in JavaScript `Map` objects. There is no HTTP, no database, no persistence.
- **Mock users** — Rivers, Ashley, Marcus, Jordan, Taylor are hardcoded. No authentication exists; any action is taken as Rivers by default.
- **Mock attachments** — file metadata exists but no bytes are stored. "Upload" adds an in-memory record only.
- **Mock email/text** — "Mark as Sent" logs a comment and marks a step done. No email is dispatched.
- **Mock stage history** — seeded with plausible past transitions; new moves are recorded in memory only.

Everything else — the board UI, drag-and-drop, step checklists, scorecard, comments, notes, file explorer, analytics, filters, keyboard navigation, Cmd+K, print view — is production-quality and requires **no changes** when the backend is wired up, because all UI components talk only to the `LoanService` interface.

---

## Database Schema

The schema is already fully defined in `src/types/index.ts`. Below is the relational mapping to SQL tables. Use **PostgreSQL** (via Supabase or plain Postgres).

### Core Tables

```sql
-- Users (team members who log in)
CREATE TABLE users (
  id          TEXT PRIMARY KEY,           -- nanoid
  name        TEXT NOT NULL,
  initials    TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  color       TEXT NOT NULL DEFAULT '#579dff',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Borrower entities (LLC, individual, corp, trust)
CREATE TABLE borrower_entities (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  type  TEXT NOT NULL CHECK (type IN ('LLC','Individual','Corp','Trust')),
  ein   TEXT
);

-- Principals (guarantors / signers)
CREATE TABLE principals (
  id                      TEXT PRIMARY KEY,
  first_name              TEXT NOT NULL,
  last_name               TEXT NOT NULL,
  email                   TEXT,
  phone                   TEXT,
  id_type                 TEXT CHECK (id_type IN ('DriversLicense','Passport','Other')),
  id_number               TEXT,
  id_image_attachment_id  TEXT   -- FK → attachments.id (nullable)
);

-- Parcels (collateral properties, many per loan)
CREATE TABLE parcels (
  id            TEXT PRIMARY KEY,
  address_line  TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  acreage       NUMERIC,
  property_type TEXT CHECK (property_type IN ('Land','SFR','Commercial','Other')),
  valuation     NUMERIC
);

-- Loans (one row per loan; stageId is the only field drag-and-drop changes)
CREATE TABLE loans (
  id                     TEXT PRIMARY KEY,
  stage_id               TEXT NOT NULL REFERENCES stages(id),
  lending_entity         TEXT NOT NULL DEFAULT 'APL',
  borrower_entity_id     TEXT NOT NULL REFERENCES borrower_entities(id),
  principal_id           TEXT NOT NULL REFERENCES principals(id),
  loan_amount            NUMERIC NOT NULL,
  current_balance        NUMERIC NOT NULL,
  interest_rate          NUMERIC NOT NULL,        -- percentage, e.g. 14.0
  servicer               TEXT NOT NULL DEFAULT 'NSC',
  origination_date       DATE,
  closing_date           DATE,
  funded_date            DATE,
  first_payment_date     DATE,
  payment_due_day        INTEGER CHECK (payment_due_day IN (1,10,20)),
  auto_pay_enabled       BOOLEAN NOT NULL DEFAULT false,
  display_label          TEXT NOT NULL,
  referral_partner       TEXT,
  loan_position          TEXT,
  title_company_id       TEXT REFERENCES external_parties(id),
  has_draw_program       BOOLEAN NOT NULL DEFAULT false,
  is_starred             BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- Junction: loans ↔ parcels (one loan can have many parcels)
CREATE TABLE loan_parcels (
  loan_id   TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  parcel_id TEXT NOT NULL REFERENCES parcels(id),
  PRIMARY KEY (loan_id, parcel_id)
);

-- Stages (fixed 8 rows; seeded once, not user-editable in v1)
CREATE TABLE stages (
  id      TEXT PRIMARY KEY,   -- 'stage-1' … 'stage-8'
  order   INTEGER NOT NULL UNIQUE,
  name    TEXT NOT NULL,
  color   TEXT NOT NULL
);

-- Process steps (fixed SOP checklist; seeded, not user-editable in v1)
CREATE TABLE process_steps (
  id                  TEXT PRIMARY KEY,
  stage_id            TEXT NOT NULL REFERENCES stages(id),
  order               INTEGER NOT NULL,
  label               TEXT NOT NULL,
  owner_role          TEXT,
  action_type         TEXT,
  desired_outcome     TEXT,
  template_id         TEXT,
  external_party_type TEXT,
  severity            TEXT CHECK (severity IN ('normal','critical')),
  rule_key            TEXT,
  sub_workflow        TEXT CHECK (sub_workflow IN ('draw','extension'))
);

-- Per-loan step statuses (high-write; one row per loan × step)
CREATE TABLE loan_step_statuses (
  id            TEXT PRIMARY KEY,
  loan_id       TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  step_id       TEXT NOT NULL REFERENCES process_steps(id),
  status        TEXT NOT NULL CHECK (status IN ('done','not_done','na')) DEFAULT 'not_done',
  completed_by  TEXT REFERENCES users(id),
  completed_at  TIMESTAMPTZ,
  UNIQUE (loan_id, step_id)    -- one status per loan × step
);

-- Comments (loan-level, tagged with stage at time of writing)
CREATE TABLE comments (
  id         TEXT PRIMARY KEY,
  loan_id    TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  stage_id   TEXT NOT NULL REFERENCES stages(id),
  author_id  TEXT NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  resolved   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Attachments (metadata only in v1; add storage_key for real files)
CREATE TABLE attachments (
  id              TEXT PRIMARY KEY,
  loan_id         TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  kind            TEXT CHECK (kind IN ('ID','Deed','TermSheet','Settlement','Other')),
  category        TEXT CHECK (category IN ('Underwriting','Loan Docs','Title','Final Loan Docs','NSC','Insurance','Draw')),
  file_type       TEXT CHECK (file_type IN ('pdf','jpg','png','docx','xlsx','other')),
  status          TEXT CHECK (status IN ('requested','received','verified','waived')) DEFAULT 'requested',
  size_bytes      INTEGER,
  uploaded_at     TIMESTAMPTZ,
  uploaded_by_id  TEXT REFERENCES users(id),
  storage_key     TEXT        -- S3/Supabase Storage object key (null in demo)
);

-- Loan notes (one free-form note per loan, upserted)
CREATE TABLE loan_notes (
  loan_id     TEXT PRIMARY KEY REFERENCES loans(id) ON DELETE CASCADE,
  body        TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT now(),
  updated_by  TEXT REFERENCES users(id)
);

-- Stage change history (append-only audit log)
CREATE TABLE stage_change_events (
  id            TEXT PRIMARY KEY,
  loan_id       TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  from_stage_id TEXT NOT NULL REFERENCES stages(id),
  to_stage_id   TEXT NOT NULL REFERENCES stages(id),
  moved_at      TIMESTAMPTZ DEFAULT now(),
  moved_by      TEXT REFERENCES users(id)
);

-- External parties (NSC, Titan Bank, law firms, title companies, inspectors)
CREATE TABLE external_parties (
  id     TEXT PRIMARY KEY,
  type   TEXT NOT NULL CHECK (type IN ('servicer','title','law_firm','inspector','bank')),
  name   TEXT NOT NULL,
  phone  TEXT,
  email  TEXT,
  notes  TEXT
);

-- Message templates (SOP email/text templates)
CREATE TABLE message_templates (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  channel      TEXT NOT NULL CHECK (channel IN ('email','text')),
  subject      TEXT,
  body         TEXT NOT NULL,
  merge_fields TEXT[]   -- e.g. ['Borrower First Name', 'Property Address']
);
```

### Indexes (add after seeding)

```sql
CREATE INDEX idx_loan_step_statuses_loan_id ON loan_step_statuses(loan_id);
CREATE INDEX idx_comments_loan_id            ON comments(loan_id);
CREATE INDEX idx_attachments_loan_id         ON attachments(loan_id);
CREATE INDEX idx_stage_change_events_loan_id ON stage_change_events(loan_id);
CREATE INDEX idx_loans_stage_id              ON loans(stage_id);
CREATE INDEX idx_loans_is_starred            ON loans(is_starred) WHERE is_starred = true;
```

---

## Replacing the Mock with a Real Backend

### Option A — Supabase (recommended for fastest path)

Supabase gives you Postgres + auth + storage + real-time out of the box.

1. **Create a Supabase project** at supabase.com.
2. **Run the schema SQL** above in the Supabase SQL editor.
3. **Seed the static data** — stages, process_steps, external_parties, message_templates from the TypeScript constants in `src/data/`.
4. **Create `src/services/SupabaseLoanService.ts`** that implements the `LoanService` interface using `@supabase/supabase-js`. Each method maps directly to a Supabase query. No UI changes required.
5. **Swap the provider** in `src/context/LoanServiceProvider.tsx`: replace `new MockLoanService()` with `new SupabaseLoanService(supabaseClient)`.
6. **Enable Row Level Security (RLS)** on every table. Policy: authenticated users at Anchor Point can read all rows; writes are restricted to their user ID where applicable (comments, step statuses).

### Option B — Custom REST API

Build a Node.js (Express/Fastify) or Python (FastAPI) service. Each `LoanService` method becomes one route. Deploy to Railway, Render, or Vercel Functions.

---

## Authentication

The app currently has no auth. Add it before any real data touches the system.

**Recommended: Clerk** (fastest) or **Supabase Auth** (if using Supabase).

Steps:
1. Wrap `<App>` in the auth provider (`<ClerkProvider>` or Supabase `SessionContextProvider`).
2. Add a sign-in page or modal (Clerk's `<SignIn />` component takes ~10 minutes).
3. Gate `AppShell` behind `useAuth()` — redirect unauthenticated users.
4. Replace the hardcoded `SEED_USERS[0].id` author in `MockLoanService` with the real session user ID passed through the service.
5. Map Clerk/Supabase user IDs to the `users` table on first login (upsert by email).

---

## File Storage (Attachments)

The demo stores attachment metadata only. For real files:

1. Create an **S3 bucket** or **Supabase Storage bucket** named `loan-documents`.
2. Add a `storage_key` column to `attachments` (already in schema above).
3. On upload: PUT the file to storage, get back the key, insert an `attachments` row with that key.
4. On preview/download: generate a signed URL from the storage key (expires in 15 min).
5. The `AttachmentList` and `FileMetaPanel` components need a "Download" or "Preview" button that calls the signed URL endpoint.

---

## Email / Text Sending

The demo's "Mark as Sent" logs a comment. For real sending:

1. **Email**: integrate **SendGrid**, **Postmark**, or **AWS SES**. Create a `/api/send-email` serverless function that accepts `{ templateId, loanId, to }`, calls `renderTemplate()` on the server, and dispatches via the provider.
2. **Text (SMS)**: integrate **Twilio**. Same pattern via `/api/send-sms`.
3. Update `StageStepChecklist`'s "Mark as Sent" button to POST to the send endpoint before marking the step done.
4. Log sent messages as `comments` server-side (already the pattern in the demo).

---

## Deployment (Web App)

### Frontend — Vercel

```bash
# From the project root
vercel                    # preview deploy
vercel --prod             # production deploy
```

Required env vars in Vercel dashboard:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...    # if using Clerk
```

### Backend (if Option B — separate API)

Deploy to **Railway** or **Render**:
```bash
# Railway
railway up

# Render — connect GitHub repo, set build/start commands
```

Or use **Vercel Functions** (`/api/*.ts` files) for a serverless approach that co-deploys with the frontend.

### Database — Supabase or Managed Postgres

- Supabase: managed Postgres, no ops needed.
- Self-hosted: use **Railway Postgres** or **Neon** (serverless Postgres).
- Run migrations with a simple migration tool (e.g. `node-postgres` scripts, Flyway, or Supabase migrations).

### Custom Domain

In Vercel: Settings → Domains → Add `board.anchorpointlending.com` (or similar). Update DNS CNAME to `cname.vercel-dns.com`.

---

## Demo → Final State Checklist

| Area | Demo State | What's Needed for Production |
|---|---|---|
| Data persistence | In-memory, resets on refresh | PostgreSQL (Supabase recommended) |
| Authentication | None — all actions as "Rivers" | Clerk or Supabase Auth; gate the app behind login |
| Users | 5 hardcoded seed users | Real user table; auto-provision on first login |
| File attachments | Metadata only; no bytes | S3 or Supabase Storage; signed URL previews |
| Email sending | Logs a comment only | SendGrid/Postmark + `/api/send-email` function |
| Text / SMS | Logs a comment only | Twilio + `/api/send-sms` function |
| Stage history | In-memory only | `stage_change_events` table; append on every move |
| Loan notes | In-memory only | `loan_notes` table; upsert on save |
| Scorecard inputs | Hardcoded per-loan in `underwriting.ts` | Real fields on loan (NOI, project cost, liquidity, equity); input form in detail panel |
| Valuation anchor points | Count hardcoded in seed | `valuation_anchors` junction table; tracked per loan |
| Message templates | Hardcoded in `messageTemplates.ts` | `message_templates` table; editable in admin UI |
| External parties | Hardcoded in `externalParties.ts` | `external_parties` table; editable per loan (e.g. which title company) |
| Real-time updates | None; single-user session | Supabase Realtime subscriptions on `loans` / `comments` |
| Offline / multi-user | Not handled | Optimistic UI already in place; add conflict resolution |
| DocuSign / e-sign | Not present | DocuSeal or DocuSign SDK for term sheet e-signature step |
| NSC integration | Manual; "Submitted" is a step checkbox | NSC portal API (if available) or webhook on confirmation |
| Audit log | Stage history only | Full audit log table for all mutations (who changed what, when) |
| Role-based access | None | Row-level permissions: Rivers approves certain steps; Camila manages servicing |
| Backup | None | Supabase point-in-time recovery or daily pg_dump to S3 |

---

## Estimated Effort

| Milestone | Effort |
|---|---|
| Supabase schema + seed + SupabaseLoanService | 1–2 days |
| Clerk auth + user provisioning | 0.5 day |
| Vercel deploy + env vars + custom domain | 0.5 day |
| File storage (S3/Supabase) + signed URLs | 1 day |
| Email sending (SendGrid) | 0.5 day |
| Real scorecard inputs (UI form + DB fields) | 1 day |
| Role-based access (RLS policies) | 1 day |
| **MVP production-ready** | **~5–6 days** |
| Real-time multi-user (Supabase Realtime) | 1–2 days |
| NSC portal integration | TBD (depends on NSC API availability) |
| DocuSign/DocuSeal e-signature | 1–2 days |
