# Steadfast - Design System

Physician-led medical weight-management monitoring app. Calm, clinical, trustworthy, bright.
Users: Physician, Medical Assistant (MA), Patient, Practice Admin. Responsive PWA, designed mobile-first.

## Frame
- 393x852 mobile (iPhone 16/17). Keep top ~59px (status bar / notch) and bottom ~34px (home indicator) clear of tappable content.
- Screen edge padding 20px. 8pt spacing scale: 4, 8, 12, 16, 24, 32.

## Color (use ONLY these colors; no default violet/indigo, no flat neutral grey)
- Background (page): #F4F6FC (cool tinted near-white)
- Surface (cards, sheets): #FFFFFF
- Surface alt (grouped rows): #F4F6FC
- Accent (bright cornflower, large fills, icons, active states, hero numerals): #6784FE
- Accent fill (any button or chip with a WHITE label): #4165FE
- Accent tint (selected chips, badges, soft fills): #E9EDFF
- Accent pressed: #2E52E6
- Support (soft coral, secondary chart series, illustration accents only, never a primary button): #F7979A
- Text primary: #0C101F, text secondary: #4A5068, text tertiary / placeholder: #8A90A8
- Border / hairline: #E2E6F2
- Semantic: success #16A34A (tint #DCFCE7), warning #D97706 (tint #FEF3C7), danger #DC2626 (tint #FEE2E2)
- Clinical flags use WARNING amber, not red alarm. Brand accent is never used for status.

## Gradient + focal rules
- One soft 2-stop gradient (#6784FE -> #F7979A at low contrast, mostly accent) allowed on the hero / focal card or onboarding hero only. Tab bar, inputs and body text stay flat.
- Every screen has ONE bold focal element (big numeral card, hero chart, or hero photo). Everything else is quiet.

## Typography
- UI + body: Questrial. Display (screen titles, hero headlines): Bodoni Moda. Numerals: Questrial.
- Display 32 / 700 / -0.02em - hero numbers, headlines
- Title 20 / 600 - section headers, card titles
- Body 16 / 400
- Label 14 / 500 - buttons, tabs, chips
- Caption 13 / 500 - text secondary, metadata, sources

## Shape + elevation
- Radius: card 20, control 14, input 12, pill 999.
- Card shadow soft only: 0 1px 2px rgba(12,16,31,.04), 0 8px 24px rgba(12,16,31,.06). No hard or black shadows.

## Icons
- ONE set: rounded outline (Lucide style), 24px, 1.75 stroke. Never mix filled and outline.

## Controls (one spec, reused on every screen)
- Primary button: pill, 52px tall, #4165FE fill, white label 16/600; pressed #2E52E6; disabled #C9D2F7.
- Secondary button: pill, white fill, 1.5px #4165FE border, #4165FE label.
- Text input: 12px radius, 1px #E2E6F2 border, white fill, unit suffix chip at right (lb, kg, %, mmHg, bpm, mg/dL); focus = 2px #6784FE ring; error = #DC2626 border + helper text.
- Card: 20px radius, white, soft shadow.
- Chip: pill 32px; selected #E9EDFF fill + #4165FE label; unselected white + #E2E6F2 border.

## Shared components
- Staff bottom tab bar (Physician / MA / Admin screens): exactly 5 tabs in this order: Today (calendar-check icon), Patients (users icon), Review (clipboard-check icon), Tasks (list-checks icon), More (menu icon). Flat white bar, hairline #E2E6F2 top border, 24px outline icons, 12px labels. Active tab = #4165FE icon + label with a small #E9EDFF pill behind the icon; inactive = #8A90A8. Never rename, reorder, add or remove tabs.
- Patient bottom tab bar (patient portal screens only): exactly 4 tabs in this order: Home (home icon), Trends (trending-down icon), Check-in (clipboard-list icon), Messages (message-circle icon). Same styling as staff bar.
- Header: screen title in Bodoni Moda left, round 36px real photo avatar of the signed-in user at right with a small role chip (MD, MA, Admin). Patient screens show caption "Northside Metabolic Health" above the title.
- Review status chip: "Unreviewed" or "Flagged - awaiting clinician review" (#D97706 on #FEF3C7), "Ready for MD review" (#4165FE on #E9EDFF), "Reviewed by Dr. Marsh - date" (#16A34A on #DCFCE7).
- Source tag on every measurement: small caption tag with device + who entered (e.g. "Hume Body Pod - J. Lee, MA"). Staff-entered = solid border tag; patient-reported = dashed border tag.
- Estimates: body-composition values carry a small "Estimate" tag.
- Missing data shows "Not measured" or "No reading", never 0.
- Safety banner (where relevant): soft #E9EDFF info banner "Not monitored 24/7. Not for emergencies - call 911."

## Imagery
- Imagery: real photography only; empty states and onboarding also use real photos or flat 2D vector art. NO 3D renders, claymorphism, isometric, CGI or glossy plastic objects.
- Photos: calm modern clinic interiors, diverse real patients and clinicians, natural daylight, subtle cornflower and coral accents in wardrobe or decor.

## Voice
- Clear, calm, clinical. The app organizes data for clinician review; it never diagnoses, never recommends doses, never implies an unreviewed record is approved.
