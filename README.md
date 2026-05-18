# Insurance Denial Appeal Generator

A patient-facing web application that guides patients through a structured intake, uses the Anthropic Claude API to generate a professional insurance appeal letter, and routes completed letters through a staff review queue before submission.

---

## Tech Stack

- **Next.js 14** (App Router) — full-stack framework
- **Tailwind CSS** — styling
- **Prisma + SQLite** — local database (swap to PostgreSQL for production)
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) — AI generation and document parsing
- **pdf-lib** — PDF generation

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <your-repo>
cd insurance-appeal-app
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```
ANTHROPIC_API_KEY=sk-ant-...       # Your Anthropic API key
ADMIN_PASSWORD=changeme            # Password for the staff review queue
OUTPUT_DIR=./output                # Local folder for PDF output
DATABASE_URL="file:./dev.db"       # SQLite database path
```

### 3. Initialize the database

```bash
npm run db:push
npm run db:generate
```

### 4. Create output directories

```bash
mkdir -p output/appeals output/approved output/uploads
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the patient intake wizard.

Open [http://localhost:3000/admin/review](http://localhost:3000/admin/review) for the staff review queue.

---

## Project Structure

```
/app
  /intake                  — Patient intake wizard (Steps 1–10)
  /admin
    /review                — Staff review queue
  /api
    /parse                 — POST: parse denial notice via Claude vision
    /generate              — POST: generate appeal letter (4x Claude calls)
    /admin/cases           — GET: list all cases (admin only)
    /admin/cases/[id]      — GET: case detail, PATCH: approve or reject

/lib
  generate.ts              — Appeal generation orchestration (4 Claude calls)
  parse.ts                 — Denial notice parsing via Claude vision
  pdf.ts                   — PDF generation and file export
  db.ts                    — Prisma client
  auth.ts                  — Admin basic auth helper
  /prompts
    narrative.ts           — Personal narrative prompt
    clinical-step-therapy.ts
    clinical-medical-necessity.ts
    clinical-formulary.ts
    policy.ts              — Policy & legal argument prompt
    assembly.ts            — Final assembly prompt

/components
  /intake                  — Step-by-step intake wizard components
  /admin                   — CaseRow, LetterPreview
  /ui                      — StepShell, ProgressBar

/prisma
  schema.prisma            — Case data model
```

---

## How It Works

### Patient Flow

1. **Upload denial notice** — Claude vision extracts insurer, patient name, medication, denial date, and denial reason automatically
2. **Guided intake** — 9 question screens collect condition, duration, prior treatments and outcomes, prescriber info, and a personal narrative
3. **Review & submit** — Patient confirms all data before submission
4. **Generation** — Three Claude API calls run in parallel for the narrative, clinical evidence, and policy sections; a fourth call assembles the final letter
5. **Status screen** — Patient sees a confirmation that their appeal is in staff review

### Staff Flow

1. Navigate to `/admin/review` and enter the admin password
2. Browse the queue filtered by status (Pending / Approved / Rejected)
3. Open any case to see the full letter preview
4. **Approve** — moves the PDF to `output/approved/{caseId}.pdf` and marks the case approved (ready for EHR/SFTP pickup)
5. **Reject** — requires reviewer notes; marks the case rejected

### AI Generation

Each appeal uses four modular Claude calls:

| Call | Prompt | Purpose |
|------|--------|---------|
| 1 | `narrative.ts` | Personal story in patient's voice |
| 2 | `clinical-{type}.ts` | Evidence-based clinical argument (denial-type aware) |
| 3 | `policy.ts` | Policy and legal rights argument (denial-type aware) |
| 4 | `assembly.ts` | Assembles all three into a formatted letter |

Denial types handled: `step_therapy`, `medical_necessity`, `formulary_exclusion`

The denial type is mapped automatically from the text extracted from the denial notice.

---

## PDF Output

Generated PDFs are saved to:
- `output/appeals/{caseId}.pdf` — all generated letters (pending review)
- `output/approved/{caseId}.pdf` — approved letters (ready for EHR/SFTP delivery)

To integrate with an SFTP/EHR system, hook into the approve action in `app/api/admin/cases/[id]/route.ts` — specifically the `action === 'approve'` branch, which already calls `approvePDF()` and logs the path.

---

## Production Deployment

To deploy to production:

1. **Database**: Swap SQLite for PostgreSQL by updating `prisma/schema.prisma` and `DATABASE_URL`
2. **File storage**: Replace the local `output/` directory with S3 or your EHR SFTP target in `lib/pdf.ts`
3. **Admin auth**: Replace the basic auth in `lib/auth.ts` with your identity provider
4. **Environment**: Set `ANTHROPIC_API_KEY` and `ADMIN_PASSWORD` as production secrets
5. **Build**: `npm run build && npm start`

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key from console.anthropic.com |
| `ADMIN_PASSWORD` | ✅ | Password to access `/admin/review` |
| `OUTPUT_DIR` | Optional | PDF output directory (default: `./output`) |
| `DATABASE_URL` | ✅ | Prisma database URL (SQLite: `file:./dev.db`) |

---

## EHR Integration Note

The SFTP/EHR delivery layer is intentionally stubbed. Approved PDFs are written to `output/approved/`. To connect to an EHR:

1. Edit the `approvePDF()` function in `lib/pdf.ts` to add SFTP upload logic after the file copy
2. Or add a webhook/queue trigger in the approve route (`app/api/admin/cases/[id]/route.ts`)
3. Define the SFTP credentials as environment variables

Do not implement EHR authentication changes without consulting the EHR integration spec.
