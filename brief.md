# Steadfast - Source Brief

## Title
Steadfast - Physician-Led Weight Care Monitoring

## Description
Steadfast is a secure, installable web app for medical weight-management clinics. Medical
assistants record weight, body composition, blood pressure and lab results from each visit,
with the measuring device and the person who entered it attached to every value. The
physician works from a review queue that shows what changed and why it needs attention,
writes an assessment, signs, and assigns follow-up tasks or sends a reviewed message.
Patients sign in to see their own progress, complete a structured monthly check-in and send
non-urgent questions, while practice administrators manage users, roles, reports and exports.

## Store links
Not yet published. Runs as a Progressive Web App: https://nextjs-weight-care-monitor.vercel.app

## Platform
Both (iOS and Android through the browser, installable PWA) plus desktop and tablet browsers.

## Category
Medical / Health and Fitness

## Features
- Role-based sign-in for Physician, Medical assistant, Practice admin and Patient, with an MFA step
- MA dashboard: patients due today, missing measurements, records ready for review, overdue check-ins
- Patient list with search and status filters
- Longitudinal patient record with weight change since enrollment, latest values, sources and review status
- Weight and body-composition entry with device source, lb / kg, estimate labels and "Not measured" instead of zero
- Blood pressure entry with a physician-configured review rule ("a flag is not a diagnosis")
- Weight and body-fat trend charts with visible gaps, entry history and corrections with a required reason
- BP history chart with the review threshold, lab results with the lab's own reference range and flag
- Medication record that separates the authorized plan, the medication list, patient-reported adherence and clinical review
- Physician review queue and sign-off screen with follow-up task and clinician-reviewed patient message
- Tasks with automated vs person-assigned tags
- Patient portal: progress, monthly check-in one question per step, messages, education, first-visit checklist
- Operational reports and permission-checked, audit-logged CSV export
- Users and roles with a permission matrix and instant access removal
- Append-only audit log and practice settings for review rules and patient visibility
- Responsive layout (tab bar on phone, sidebar on desktop) and installable PWA

## Tech stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 with design tokens, Questrial and Bodoni Moda fonts, Material Symbols icons
- Zustand state with persistence for the demo data layer
- Recharts for trend, blood pressure and sparkline charts
- Web app manifest, maskable icons and a static-asset service worker
- Hosted on Vercel; production design targets AWS (RDS PostgreSQL, S3, SES, ECS / App Runner) under a BAA

## Industry
Healthcare - medical weight management, clinical monitoring

## Metrics
Unpublished POC, no usage metrics. Scope: 25 routes covering 4 roles, 20 designed screens plus
desktop layouts, live on Vercel.

## Research notes
- Verified: every screen runs against the shared store; saves, corrections, sign-offs, check-ins, messages, access changes and exports work end to end and appear in the audit log.
- Verified: role gating, permission matrix for export and signing, patient isolation, PWA manifest, service worker and security headers on the live deployment.
- Mocked: all patients, staff, measurements, labs, medications and photos are sample data; sign-in and MFA accept demo credentials; data is stored in the browser only.
- Mocked: lab report files, email reminders and backups are represented in the UI only.
- Future expansion: server database and API on HIPAA-eligible AWS, real authentication with MFA, encrypted file storage, PHI-free email reminders, Hume Health or other device integration, EHR / lab system links, native iOS and Android apps.
