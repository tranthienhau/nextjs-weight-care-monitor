# Steadfast - Physician-Led Weight Care Monitoring (Next.js PWA)

A secure, installable web app (PWA) for a physician-led medical weight-management program.
Medical assistants enter measurements from office visits, the platform keeps a longitudinal
record for every patient, the physician reviews and signs from one queue, and patients follow
their own progress and complete a monthly check-in.

**Live demo:** https://nextjs-weight-care-monitor.vercel.app (demo accounts on the sign-in screen, mock data only)

![Next.js](https://img.shields.io/badge/Next.js-16-0C101F) ![TypeScript](https://img.shields.io/badge/TypeScript-5-4165FE) ![PWA](https://img.shields.io/badge/PWA-installable-6784FE) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-4165FE) ![Mock data](https://img.shields.io/badge/data-mock%20only-F7979A)

## Demo

| iOS (Safari) | Android (Chrome) |
|---|---|
| ![iOS demo](screenshots/demo.gif) | ![Android demo](screenshots/demo-android.gif) |

Same codebase running on both platforms, straight from the browser (installable to the home screen).

**Desktop browser**

![Desktop demo](screenshots/demo-desktop.gif)

## What it shows

- **Four roles, one app:** Physician, Medical assistant (MA), Practice admin and Patient, each with its own home, navigation and permissions.
- **MA data entry:** weight and body composition with the measuring device as source, lb / kg, estimates labelled, "Not measured" instead of zero, and blood pressure with the practice's review rule.
- **Longitudinal record:** weight and body-fat trends with visible gaps, BP history with the review threshold, labs with the lab's own reference range and flag, and medications split into plan, list, patient-reported adherence and clinical review.
- **Corrections with an audit trail:** every edit needs a reason and keeps the original value.
- **Physician review:** a queue of what needs review and why, then one screen to write the assessment, sign, assign a follow-up task and send a clinician-reviewed message.
- **Patient portal:** progress since enrollment, monthly check-in one question per step, non-urgent messages, education, and a first-visit checklist.
- **Admin:** operational reports, permission-checked CSV export, users and roles with instant access removal, and an append-only audit log.
- **Responsive PWA:** bottom tab bar on phones, sidebar on desktop, installable with a web manifest and a static-only service worker.

## How it works

```mermaid
flowchart LR
  P["Patient<br/>signs in, sees progress,<br/>fills monthly check-in"]
  M1["Medical assistant<br/>enters weight, body<br/>composition, BP, labs"]
  M2["Medical assistant<br/>checks sources, fixes errors,<br/>marks ready for review"]
  D1["Physician<br/>reviews trends and flags,<br/>writes note, signs"]
  D2["Follow-up<br/>task for staff or<br/>reviewed reply to patient"]
  R["Flags follow rules set by the physician.<br/>Nothing shows as reviewed until the physician signs."]

  P -- answers that need attention --> M2
  M1 -- saved with source --> M2
  M2 -- goes to review queue --> D1
  D1 -- creates --> D2
  D2 -- reply or reminder --> P
  D1 -.- R
```

| Who | What they do |
|---|---|
| **Physician** | Reviews the queue, sees trends, writes an assessment, signs the review, assigns follow-up tasks. |
| **Medical assistant** | Enters weight, body composition, blood pressure, pulse and lab results, corrects errors, marks records ready for review. |
| **Patient** | Sees permitted measurements and trends, completes the monthly check-in, reads approved education, sends non-urgent questions. |
| **Practice admin** | Manages users, roles and settings, runs operational reports and exports. No clinical access by default. |

### Clinical safety rules

| Rule | How it works |
|---|---|
| No diagnosis | The app stores, displays and routes data. It never labels a condition or interprets a result beyond the lab's own flag. |
| Review flags | Rules (for example systolic 140 or higher) are set by the physician. A flag means "please review", not a diagnosis. |
| Reviewed means signed | A record shows "Reviewed" only after a physician signs it, with name and time. |
| Medications | Plan, list, patient-reported adherence and clinical review are kept separate. The app never prescribes, changes or suggests doses. |
| Estimates and gaps | Body-composition values carry an "Estimate" tag; a value not taken is "Not measured", never 0, and charts show the gap. |
| Not an emergency channel | Patient screens show "Not monitored 24/7. For emergencies call 911." |

## Screenshots

### Medical assistant and clinical record

| Today | Patients | Patient record | New measurement |
|---|---|---|---|
| ![Today](screenshots/02-ma-today.png) | ![Patients](screenshots/03-patients.png) | ![Record](screenshots/04-patient-record.png) | ![New measurement](screenshots/05-new-measurement.png) |
| **Blood pressure entry** | **Weight trends** | **BP history** | **Labs** |
| ![BP entry](screenshots/06-blood-pressure-entry.png) | ![Trends](screenshots/07-weight-trends.png) | ![BP history](screenshots/08-bp-history.png) | ![Labs](screenshots/09-labs.png) |

### Physician, team and admin

| Medications | Review queue | Sign review | Tasks |
|---|---|---|---|
| ![Medications](screenshots/10-medications.png) | ![Review queue](screenshots/11-review-queue.png) | ![Sign review](screenshots/12-sign-review.png) | ![Tasks](screenshots/13-tasks.png) |
| **Reports** | **Users and roles** | **Audit log** | **Sign in** |
| ![Reports](screenshots/14-reports.png) | ![Users](screenshots/15-users-roles.png) | ![Audit log](screenshots/16-audit-log.png) | ![Sign in](screenshots/01-sign-in.png) |

### Patient portal

| Home | First visit | Monthly check-in | Messages |
|---|---|---|---|
| ![Home](screenshots/17-patient-home.png) | ![First visit](screenshots/18-patient-first-visit.png) | ![Check-in](screenshots/19-monthly-check-in.png) | ![Messages](screenshots/20-patient-messages.png) |

### Desktop browser

| | |
|---|---|
| ![Sign in](screenshots/d1-desktop-sign-in.png) | ![Today](screenshots/d2-desktop-ma-today.png) |
| ![Patient record](screenshots/d3-desktop-patient-record.png) | ![Weight trends](screenshots/d4-desktop-weight-trends.png) |
| ![Review queue](screenshots/d5-desktop-review-queue.png) | ![Sign review](screenshots/d6-desktop-sign-review.png) |
| ![Reports](screenshots/d7-desktop-reports.png) | ![Patient portal](screenshots/d8-desktop-patient-portal.png) |

## Security, privacy and compliance

Privacy and security are part of the first design, not added later. The production platform
is built on HIPAA-eligible services, in a cloud account the practice owns, under a signed
Business Associate Addendum (BAA). The right-hand column shows what this demo already does.

```mermaid
flowchart LR
  U(("Every user")) -- signs in --> L1["1. Sign-in<br/>own account,<br/>MFA for staff"]
  L1 -- passes --> L2["2. Role check<br/>sees only what<br/>the role allows"]
  L2 -- travels over --> L3["3. Encrypted link<br/>HTTPS everywhere"]
  L3 -- recorded by --> L4["4. Audit log<br/>who saw or changed<br/>what, and when"]
  L4 -- reaches --> D[("Patient data<br/>encrypted at rest,<br/>backed up daily")]
```

| Area | Production approach | In this demo |
|---|---|---|
| **Encryption** | HTTPS (TLS 1.2+) for every connection. Database, backups and files encrypted at rest (AES-256, managed keys). | HTTPS on Vercel, security headers (nosniff, frame deny, referrer and permissions policy). |
| **Accounts and sign-in** | One account per person, MFA required for staff, lockout, secure password reset, idle sign-out. | Email + password, 6-digit MFA step and passkey button (demo accounts, any code accepted). |
| **Role-based access** | Physician, MA, Admin and Patient roles plus a permission matrix the practice controls. Admin has no clinical access by default. | Enforced in every screen: role gate per area, permission matrix drives export, signing and clinical views. |
| **Least privilege** | Each role sees only what it needs. Internal notes never reach the patient portal. | Patients see only their own data and the fields the practice allows; MAs cannot sign reviews or export. |
| **Audit log** | Append-only log of who viewed, created, changed or exported clinical data, with before and after values. | Every save, correction, sign-off, export, access change and sign-in is written to the audit log screen. |
| **Corrections** | Reason required, original value kept. | Implemented with full edit history per entry. |
| **Environments and test data** | Separate dev, staging and production. No real patient data outside production. | Mock data only, generated in code. No real patient information anywhere. |
| **Files** | Lab reports private and encrypted, opened through short-lived signed links. | Report shown as an encrypted attachment row (no real files). |
| **Backups and recovery** | Daily backups, 35-day point-in-time restore, restore tested before go-live. | Not applicable (no server database in the demo). |
| **Notifications** | Email and in-app reminders carry no health details. | Automated reminders tagged as automated; clinician replies tagged "Reviewed and sent by". |
| **Staff leaving** | One action removes access and ends active sessions. | "Remove access" on Users and roles, logged to the audit trail. |
| **Offline cache** | The service worker never caches patient data. | Service worker caches static assets only (JS, CSS, fonts, icons, images). |

## HIPAA and third parties

- Production hosting on AWS with the BAA accepted in the practice's own account.
- Only services covered by that BAA handle patient information: app hosting, database, file storage, email and logs.
- **No** analytics, crash reporting, AI services or support tools receive patient information. Error reports are scrubbed of personal data.
- A full hosting and third-party inventory (who, what data, BAA status) is part of the security documentation.
- Data retention, deletion and export procedures are agreed with the practice before launch.
- Compliance is shared: the build provides and documents the technical safeguards; the practice keeps its policies, training and BAAs.
- **FDA position:** the app stores, displays and organizes information for clinician review. It does not diagnose, recommend treatment or change medication, and every flag uses a rule the physician sets and resolves.
- This demo runs on Vercel with **mock data only** and is not a HIPAA environment. Do not enter real patient information.

## Architecture

### Production architecture

```mermaid
flowchart TB
  Users(("Physician, MA,<br/>Admin, Patient"))
  subgraph AWS["Practice-owned AWS account, signed BAA, US region"]
    Web["Steadfast web app<br/>Next.js + TypeScript PWA"]
    subgraph Svc["Server services"]
      Auth["Sign-in<br/>MFA, roles, timeout"]
      Rules["Business rules<br/>flags, sign-off, tasks"]
      Audit["Audit log<br/>append-only"]
      Notify["Notifications<br/>in-app, PHI-free email"]
    end
    subgraph Data["Encrypted storage"]
      DB[("PostgreSQL<br/>daily backups,<br/>35-day restore")]
      Files[("File store<br/>lab report PDFs")]
    end
  end
  Future["Later phases<br/>Hume or other device feed,<br/>EHR / lab link"]
  Users == "HTTPS, TLS 1.2+" ==> Web
  Web -- calls --> Svc
  Svc -- reads and writes --> Data
  Future -. plugs into the same measurement store .-> Svc
```

| Layer | Technology |
|---|---|
| Web app (all roles) | Next.js + React + TypeScript, installable PWA, responsive desktop / tablet / phone |
| UI and charts | Accessible components (WCAG 2.1 AA target), Recharts for trend graphs |
| Server | Next.js server functions; every rule and permission enforced on the server |
| Database | PostgreSQL on AWS RDS, encrypted |
| Files | AWS S3, private, encrypted, short-lived signed links |
| Sign-in | Email + password with TOTP or passkey MFA, server-side sessions |
| Email | AWS SES, PHI-free templates |
| Hosting | AWS (ECS Fargate or App Runner) in a US region under the AWS BAA, Terraform |
| Monitoring | CloudWatch alarms and logs, CloudTrail for account activity |

### Data model

Every measurement is one record with type, value, unit, time, source device, entered-by,
estimate flag, patient-reported flag and review status. Capture (manual entry today, a device
feed later) is separate from storage and display, so a future device integration writes into
the same store with the same review rules and audit trail.

```mermaid
erDiagram
  PATIENT ||--o{ MEASUREMENT : has
  PATIENT ||--o{ BP_READING : has
  PATIENT ||--o{ LAB_RESULT : has
  PATIENT ||--o{ MEDICATION : has
  PATIENT ||--o{ CHECK_IN : submits
  PATIENT ||--o{ REVIEW : receives
  REVIEW ||--o{ TASK : creates
  STAFF ||--o{ MEASUREMENT : enters
  STAFF ||--o{ REVIEW : signs
  MEASUREMENT {
    string type
    decimal value "null = Not measured"
    string unit
    datetime measured_at
    string source_device
    bool is_estimate
    bool patient_reported
    string review_status
  }
  AUDIT_EVENT {
    string who
    string action
    string target
    string detail
    datetime at
  }
```

### This demo

| Concern | Implementation |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript, route groups `(staff)` and `(portal)` with role-gated shells |
| Styling | Tailwind CSS v4 with design tokens in `app/globals.css`, Questrial + Bodoni Moda, Material Symbols |
| State | Zustand store persisted to `localStorage` (`lib/store.ts`) with the same actions the API would expose: save measurements, correct, flag, mark ready, sign review, submit check-in, tasks, messages, access changes, exports |
| Data | Typed mock seed in `lib/data.ts` (`lib/types.ts` mirrors the production data model) |
| Charts | Recharts trend, BP threshold and sparkline components (`components/charts.tsx`) |
| PWA | `app/manifest.ts`, maskable icons, `public/sw.js` (static assets only) |
| Hosting | Vercel |

```
app/
  sign-in/                 sign-in, MFA step, demo accounts
  (staff)/                 staff shell: tab bar on phone, sidebar on desktop
    today/ patients/ patients/[id]/{body,bp,bp/new,labs,meds,check-ins,measure}
    review/ review/[id]/ tasks/ more/{reports,users,audit,settings}
  (portal)/portal/         patient home, trends, check-in, messages
components/                ui kit, charts, shells, per-area components (ma, clinical, review, admin, portal)
lib/                       types, mock data, store, selectors, formatting
design/                    source design screens and design system
```

## Run

```sh
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Sign in with any of the demo accounts on the sign-in screen:

| Account | Role | Lands on |
|---|---|---|
| Dr. Elena Marsh | Physician | Review queue |
| Jordan Lee | Medical assistant | Today |
| Tom Becker | Practice admin | Reports |
| Maria Alvarez | Patient | Portal home |
| Daniel Kim | New patient | First-visit checklist |

"More > Reset demo data" restores the original mock data.

## Disclaimer

Demo with mock data only. Names, photos and numbers are sample data. Not a medical device, not
monitored, and not for real patient information.
