# Iris R-One Mobile — UI/UX Analytics Specification

> **Document Version:** 2.0  
> **Product:** Iris R-One Mobile — EV Charger Asset Management & Field Operations  
> **Status:** Active Specification  
> **Audience:** Product Designers, UX Researchers, Product Managers  
> **Last Updated:** October 2026

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Who Uses This App & How](#2-who-uses-this-app--how)
3. [What We Want to Learn](#3-what-we-want-to-learn)
4. [User Journey Maps](#4-user-journey-maps)
   - [Field Technician Journey](#41-field-technician-journey)
   - [Central Team Journey](#42-central-team-journey)
5. [Screen-by-Screen UX Analytics](#5-screen-by-screen-ux-analytics)
   - [5.1 Login & Role Selection](#51-login--role-selection)
   - [5.2 Map Screen](#52-map-screen)
   - [5.3 Work Order Feed](#53-work-order-feed)
   - [5.4 Task Execution & Checklist](#54-task-execution--checklist)
   - [5.5 r-vision Scanner](#55-r-vision-scanner)
   - [5.6 Asset Detail View](#56-asset-detail-view)
   - [5.7 Create Work Order](#57-create-work-order)
   - [5.8 Notifications](#58-notifications)
   - [5.9 Profile & Preferences](#59-profile--preferences)
6. [Key User Flows & Drop-off Points](#6-key-user-flows--drop-off-points)
7. [Design Friction Signals to Monitor](#7-design-friction-signals-to-monitor)
8. [Measuring Design System Performance](#8-measuring-design-system-performance)
9. [UX Success Metrics & Targets](#9-ux-success-metrics--targets)
10. [Where Analytics Surfaces Inside the App](#10-where-analytics-surfaces-inside-the-app)
11. [Standard Event Export Matrix (GA4 / Firebase Format)](#11-standard-event-export-matrix-ga4--firebase-format)

---

## 1. Overview & Purpose

Iris R-One is a mobile operations platform for EV charging infrastructure. It connects two distinct user groups — field technicians on the ground and central operations teams in the office — in a shared, real-time workflow.

This document defines **what UI/UX analytics should be tracked**, **what questions it should answer**, and **where insights should appear inside the app**. The goal is not to collect data for its own sake, but to understand whether the design is working — whether people can do their jobs faster, with less confusion and fewer mistakes.

> **The core design question this analytics spec answers:**
> *Is the interface helping or slowing down the people who use it every day?*

---

## 2. Who Uses This App & How

Understanding the user context is the foundation of meaningful UX analytics. The same action measured differently for each persona tells a different story.

### Field Technicians
Field technicians use the app while physically on-site at EV charging stations — often outdoors in direct sunlight, wearing work gloves, carrying equipment, and working with one hand. Their usage is **task-focused and time-pressured**. Every extra tap or confusing screen costs them real time in the field.

**How they use the app:**
- Open the map to locate their next job
- Scan a charger barcode to pull up the asset
- Work through a multi-step inspection checklist
- Upload photos as evidence
- Submit the job and move to the next one

**What matters most to them:** Speed, clarity, one-handed usability, offline reliability.

---

### Central Team / Operations Managers
Central team users work from an office context, managing multiple technicians and projects simultaneously. Their usage is **supervisory and reactive** — they dispatch work, monitor progress, approve completed jobs, and respond to exceptions.

**How they use the app:**
- Review a dashboard of active and pending work orders
- Assign or create new work orders
- Monitor which technicians are where and doing what
- Approve submitted work or request rework
- View asset health and alert histories

**What matters most to them:** Visibility, control, speed of decision-making, completeness of information.

---

## 3. What We Want to Learn

Below are the key UX questions that analytics should help answer. Every metric tracked in this document maps back to one of these questions.

| # | Design Question | Why It Matters |
|:--|:---|:---|
| 1 | Are technicians completing checklists without getting stuck or confused? | Stalled checklists mean delayed work and missed SLAs |
| 2 | Is the map the right starting point for field users? | If most users skip the map and go straight to Work, the tab priority might be wrong |
| 3 | Are people using the r-vision barcode scanner, or typing manually? | Manual entry is slower and more error-prone — high manual entry suggests scanner UX is failing |
| 4 | How often do Central team users reject submitted work, and why? | High rejection rates could mean the checklist design is unclear or photo quality is insufficient |
| 5 | Are notifications driving action, or being ignored? | Ignored notifications = broken communication loop between Central and Field |
| 6 | How long does it take to create and dispatch a new work order? | Long creation time signals a complex, friction-heavy form design |
| 7 | At what point in the workflow do users abandon and come back later? | Identifies where the design breaks focus or requires too much effort |
| 8 | Are users switching theme modes — and if so, when? | Outdoor daytime use may reveal legibility issues with the current dark mode |

---

## 4. User Journey Maps

### 4.1 Field Technician Journey

```
START OF SHIFT
      │
      ▼
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│  Log In &   │ ───► │  Open Map /  │ ───► │  Find Work Order │
│ Select Role │      │  Check Work  │      │  on Work Tab     │
└─────────────┘      └──────────────┘      └──────────────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  Travel to Site  │
                                          │  (Geofence Check)│
                                          └──────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │  Scan Charger Barcode (r-vision)    │
                              │  OR manually enter CPID             │
                              └─────────────────────────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │  Accept Work Order → Start Work     │
                              └─────────────────────────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │  Execute Checklist                  │
                              │  • Toggle checks                    │
                              │  • Enter voltage readings           │
                              │  • Upload photos                    │
                              │  • Add remarks                      │
                              └─────────────────────────────────────┘
                                                    │
                                                    ▼
                              ┌─────────────────────────────────────┐
                              │  Submit for Review                  │
                              └─────────────────────────────────────┘
                                                    │
                           ┌────────────────────────┴──────────────────────┐
                           ▼                                               ▼
              ┌──────────────────────┐                     ┌──────────────────────────┐
              │  APPROVED ✓          │                     │  REJECTED — Rework       │
              │  Move to next job    │                     │  Return to checklist     │
              └──────────────────────┘                     └──────────────────────────┘
```

**Key UX moments to measure in this journey:**
- Time from app open to first meaningful action (work order opened)
- Time spent on the checklist per task type (toggles vs. photos vs. voltage inputs)
- Whether geofence check causes delay or confusion before starting work
- How often the job is submitted on the first attempt vs. after validation errors

---

### 4.2 Central Team Journey

```
START OF DAY
      │
      ▼
┌─────────────────┐      ┌───────────────────────┐
│  View Work Feed │ ───► │  Triage: Filter by    │
│  or Dashboard   │      │  Status / Priority    │
└─────────────────┘      └───────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Create New Work Order (tap + button)           │
│  • Pick station & charger                       │
│  • Select service type & template               │
│  • Assign technician & set due window           │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐      ┌───────────────────────┐
│  Monitor Map    │ ───► │  Tap station pin to   │
│  (Technician    │      │  see live status      │
│  Location View) │      └───────────────────────┘
└─────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│  Review Submitted Work Orders                    │
│  • View checklist evidence                       │
│  • Approve or Reject with reason                 │
└──────────────────────────────────────────────────┘
```

**Key UX moments to measure in this journey:**
- How quickly a work order is dispatched after being created
- How many filter interactions it takes to find the right order
- How long submitted work sits in "Under Review" before a decision
- How often jobs are rejected vs. approved on first submission

---

## 5. Screen-by-Screen UX Analytics

For each screen, we define: the **design intent**, **what success looks like**, **where friction can appear**, and **what to watch in analytics**.

---

### 5.1 Login & Role Selection

**Design Intent:** Get the right person into the right experience as fast as possible. The role selection step (Field Team vs. Central Team) routes users into completely different app shells and navigation structures.

**What Success Looks Like:**
- User logs in and selects their role without hesitation
- No one accidentally ends up in the wrong role experience
- Login is fast — zero unnecessary friction between opening the app and reaching the work

**Where Friction Can Appear:**
- If the role choice (Field vs. Central) isn't clearly explained by the UI, users may pick incorrectly and need to backtrack
- If the login page has any error states or input confusion, daily workers are delayed at the very start of every shift

**UX Questions to Answer via Analytics:**
- How often do users go back and switch their role selection after already navigating forward?
- Is there a meaningful drop-off at any step of the login flow?
- How long does it take from app open to reaching the first meaningful work screen?

---

### 5.2 Map Screen

**Design Intent:** Ground field technicians in their physical context. The map is the Field Team's starting point — a live view of nearby EV charging stations, clustered by work order type and count, so technicians can see where they need to be.

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│  [Search Bar: Station, CPID, City...]        │
│  [Filter Pills: All · Reactive · Preventive] │
│                                             │
│      ●(5)  Station cluster pins             │
│           on a dark-themed map              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ BOTTOM CARD: Station Preview        │    │
│  │ "ChargeZone Hub 02 · 3 orders · 2km"│    │
│  │ [Open Work Orders]  [Navigate]      │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**What Success Looks Like:**
- Technicians quickly identify their target station and tap into it
- The bottom preview card is used as a quick decision surface — users tap directly into work orders without needing to navigate away first
- Filter pills help users who have specific service type assignments to narrow focus

**Where Friction Can Appear:**
- Station pins overlap on small screens in dense urban areas, making it hard to tap the right one
- The search bar may be used as a workaround when pin targeting is difficult — high search usage relative to direct pin taps suggests a clustering or zoom design issue
- The bottom card carousel (swiping between stations) may not be intuitive for first-time users
- If technicians go directly to the Work tab instead of interacting with the map, the map may not be adding enough value for the field use case

**UX Questions to Answer via Analytics:**
- What percentage of field users start their session on the map vs. immediately switching to Work?
- Are users tapping station pins or using the search bar more often? (High search = low map trust)
- How often is the "Navigate / Directions" button used from the station preview card?
- Do filter pills get used, or do users always view All?
- How long do users spend on the map before navigating into a work order?

---

### 5.3 Work Order Feed

**Design Intent:** Give both Field and Central users a structured, scannable list of all work orders. Field users see their assigned work; Central users see the full fleet. Status tabs (Unassigned, Assigned, Accepted, Working, Under Review, Completed) divide the workload into clear operational stages.

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ [Search Work Orders...]                     │
│ [Unassigned][Assigned][Accepted][Working]   │
│             [Under Review][Completed]       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ● HIGH  Installation · SW-001           │ │
│ │ ChargeZone Hub · Due: Today 14:00       │ │
│ │ [Reject]              [Accept]          │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ● MED  Preventive PM · PM-1001          │ │
│ │ Shell Recharge · Tomorrow, 08:00        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**What Success Looks Like:**
- Users land on the most relevant tab by default (most used tab should be the default)
- Work order cards communicate enough information at a glance that users don't need to open each one to evaluate it
- Accept / Reject quick actions on cards reduce the need to open every work order just to make a status decision
- Central team can scan down the list and triage without opening individual items

**Where Friction Can Appear:**
- If users switch tabs many times before settling — the tab order or default tab is wrong
- If search is used frequently, the list may be too long or hard to scan (visual hierarchy issue)
- If the Accept/Reject quick action buttons on cards are tapped accidentally while scrolling, the touch targets need spacing adjustments
- Technicians with many assigned orders may feel overwhelmed if there's no clear visual priority ranking

**UX Questions to Answer via Analytics:**
- Which status tab do users navigate to most? Does this match the default tab we show on load?
- How often do users use the search bar? (High = the list is hard to scan visually)
- Are the inline Accept/Reject card actions used, or do users open the full detail first?
- What is the average number of work order cards a user scrolls past before tapping one?
- How long does a user spend on the work feed before taking any action?

---

### 5.4 Task Execution & Checklist

**Design Intent:** The checklist screen is the most critical screen in the entire app. It's where field technicians actually perform their work — following inspection steps, logging electrical readings, uploading photo evidence, and adding remarks. It must be clear, sequentially guided, and forgiving of the physical constraints of field work (gloves, one hand, bright sunlight).

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ← WO #PM-1000  Monthly PM · EV Infra        │
│ STATUS: [WORKING]         PRIORITY: [HIGH]  │
│ ChargeZone Hub · 15m from you (IN GEOFENCE) │
│                                             │
│ [Overview] [Tasks 18/24] [Tools] [Activity] │
│ ────────────────────────────────────────── │
│                                             │
│ Section 1: Visual Inspection                │
│   ☑ 1.1 Inspect CCS2 Cable         [Done]  │
│   📷 1.2 Upload Wear Evidence    [Upload]  │
│                                             │
│ Section 2: Electrical Diagnostics           │
│   ⚡ 2.1 Three-Phase Voltage               │
│   [ L-N ] [ L-E ] [ L-L ] [ N-E ]          │
│                                             │
│   ✎ 2.2 Technician Remarks                 │
│                                             │
│ [Submit for Review] ← Sticky bottom CTA    │
└─────────────────────────────────────────────┘
```

**What Success Looks Like:**
- Technicians move through checklist items in a natural top-to-bottom sequence without having to backtrack
- The sticky Submit button is only interacted with once — meaning users complete all required items before attempting to submit
- Photos are captured and attached inline without the user needing to leave the screen
- Remarks are filled in briefly but meaningfully — not left empty or filled with placeholder text
- N/A toggles are used sparingly and only for genuinely non-applicable items

**Where Friction Can Appear:**
- Hitting the Submit button before completing all required items triggers a validation error — this is a core friction point. Every validation error means the design did not successfully signal which fields were mandatory.
- The voltage input (L-N, L-E, L-L, N-E) is a technically complex field. High time spent here may indicate the labels aren't clear enough.
- If users repeatedly toggle between the Tasks subtab and the Overview subtab, they may be looking for context that isn't clearly visible in the checklist itself.
- The N/A toggle may be used to skip difficult or unclear items — unusually high N/A usage on specific items flags those items as confusing or irrelevant.
- Long text / remarks fields may be abandoned mid-way if typing on mobile feels too laborious.

**UX Questions to Answer via Analytics:**
- Which checklist items take the most time to complete? (Identifies complexity or confusion hot spots)
- How often does the Submit action trigger a validation error? Which fields are most often incomplete at submission time?
- How frequently is the N/A toggle used, and on which specific checklist items?
- Are users moving through checklist items top-to-bottom, or jumping around? (Indicates intuitive vs. non-sequential UX)
- What is the average time to complete a full PM checklist from start to submission?
- How often do users switch between the Overview and Tasks subtabs mid-checklist?
- How often is a work order submitted on the first attempt vs. after validation failure?

---

### 5.5 r-vision Scanner

**Design Intent:** The r-vision scanner is the fastest, most error-free way to identify a physical charger asset. By pointing the camera at a QR code or barcode on the charger cabinet, the app instantly looks up the asset without manual typing. This removes human error from equipment identification and saves time on every single job.

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ← Back                 [Flashlight 💡]     │
│                                             │
│         ┌──────────────────────┐            │
│         │  ┌────        ────┐  │            │
│         │  │  Point camera  │  │            │
│         │  │  at QR / barcode│  │            │
│         │  └────        ────┘  │            │
│         └──────────────────────┘            │
│                                             │
│  [Manual Entry: Enter CPID / Serial...]     │
│  [View Recent Scans (5 assets)]             │
└─────────────────────────────────────────────┘
```

**What Success Looks Like:**
- The barcode is recognised quickly without the user needing to reposition or retry
- The asset is immediately matched and the user is taken directly to the right asset detail or work order
- The scanner is the preferred entry point over typing — most users scan, not type
- The flashlight is rarely needed (indicating most usage happens in adequate lighting)

**Where Friction Can Appear:**
- If the barcode is not recognised on the first attempt, users may not understand why (too much angle, poor light, damaged sticker)
- If users frequently fall back to the manual text input, the camera experience is failing — either the recognition is too slow, the UI frame is too small, or real-world barcode labels are damaged or non-standard
- The manual text input on a mobile keyboard is tedious — if it's used often, it creates friction and error-prone data entry
- "Recent Scans" is a power feature for repeat visitors to the same station — if it goes unused, it may not be visible or discoverable enough

**UX Questions to Answer via Analytics:**
- What percentage of scanner sessions end in a successful barcode match vs. a manual CPID entry?
- How often is the flashlight toggled on? (High flashlight usage = poor ambient lighting conditions at sites — may inform future hardware decisions)
- How often does a scan attempt fail before eventually succeeding? (Indicates recognition reliability)
- Are "Recent Scans" used? If so, by which user type?
- What is the time difference between a scan session that succeeds via camera vs. one that resorts to manual entry?

---

### 5.6 Asset Detail View

**Design Intent:** Once a charger asset is scanned or selected, this screen provides its full technical profile — model, status, open alerts, work history, live electrical events, and commissioning information. It gives technicians the context they need before starting work, and gives central managers a full diagnostic picture.

**Tabs inside Asset Detail:**
- **Overview** — Key asset info: CPID, model, location, warranty, peak specs
- **Alerts** — Open fault alerts sorted by priority (Highest, High, Medium)
- **Work History** — Closed and completed jobs linked to this asset
- **Realtime Events** — Live OCPP protocol event logs

**What Success Looks Like:**
- Technicians quickly check the Alerts tab to understand any known faults before starting work
- Central managers use the Work History tab to understand the maintenance lifecycle of an asset
- The "Request PM" action is used by technicians who spot something wrong and want to flag it for future scheduled work

**Where Friction Can Appear:**
- If users land on the Overview tab but then don't engage with Alerts — they may not realise faults exist, or the alert indicator isn't prominent enough on the entry point
- If the Work History is paginated or hard to scroll through, managers may not dig deep enough to see patterns
- If the OCPP realtime events tab is never accessed, it may be too technical for non-engineers and could be conditionally hidden or restricted

**UX Questions to Answer via Analytics:**
- Which tab do users visit most after opening an asset?
- How many users view the Alerts tab on assets that have open high-priority alerts? (If < 80%, the alert visibility is insufficient)
- Is "Request PM" used, and by which user role?
- How long do users spend on this screen before navigating away?
- Do users navigate directly from an asset to its linked work order?

---

### 5.7 Create Work Order

**Design Intent:** Central team dispatchers need to be able to create and assign a new work order quickly, from any context — in response to an alert, from the project list, or proactively. The creation flow starts with the floating (+) button, presents a slide-up modal, and guides the user through service type, station, template selection, technician assignment, and due date.

**What Success Looks Like:**
- A work order is created and dispatched in under 60 seconds
- Standard PM templates are used for routine jobs, reducing manual data entry
- Custom tasks are added only when a situation requires it — not because the templates are insufficient
- The form feels short and manageable — not a long exhausting scroll

**Where Friction Can Appear:**
- If users abandon the creation modal midway (close without submitting), the form is too complex, too long, or a required field is unclear
- If users spend a long time on the station selection step, the station picker UI may be confusing or the list may be too long without good search/filter
- If custom task additions are high relative to template usage, it may mean the templates don't cover common real-world scenarios
- If data type selection for custom tasks (Short text, Number, Photo, Dropdown, etc.) causes confusion, the labels or picker design needs improvement

**UX Questions to Answer via Analytics:**
- How often do users open the creation modal and then dismiss it without submitting? (Abandonment rate)
- Which step in the form flow takes the most time? (Station selection? Template choice? Technician assignment?)
- How often is a pre-built PM template used vs. building a checklist from scratch?
- How many custom tasks are typically added on top of a template?
- What is the median end-to-end time from tapping (+) to successfully submitting a work order?

---

### 5.8 Notifications

**Design Intent:** Notifications close the loop between field and central. When a work order is assigned, completed, or rejected, the other party should be immediately aware. The notification centre aggregates all updates in one place, with filters for starred items and unread count badges.

**Notification types in the app:**
- Reactive Work Assigned
- Preventive PM Scheduled
- PM Inspection Due
- Work Completed

**What Success Looks Like:**
- Unread notifications are acted on quickly — they lead to the user opening the linked work order
- Starred notifications are used to bookmark urgent items that need follow-up
- The notification centre is checked daily, not just when a badge count appears

**Where Friction Can Appear:**
- If users open the notification centre but don't tap through to the linked work order, the notification message isn't compelling enough or the link-through UX is unclear
- If users accumulate many unread notifications without acting on them, the volume or timing of notifications may be causing notification fatigue
- If the notification centre is rarely opened except when badge count is non-zero, it's purely reactive and not a daily habit — which may be fine or a concern depending on the role

**UX Questions to Answer via Analytics:**
- What percentage of notifications are tapped through to the linked work order?
- How many unread notifications accumulate on average before the user opens the screen?
- Are starred notifications used? By which user type?
- Which notification type (Reactive, Preventive, PM Due, Completed) drives the most follow-through action?

---

### 5.9 Profile & Preferences

**Design Intent:** A lightweight settings area for the user to manage their role, appearance preferences (Light vs. Dark mode), language, and account controls. It also provides a shortcut to the Central Team Dashboard for supervisors.

**What Success Looks Like:**
- Role switching is used intentionally by multi-role users, not as a navigation workaround
- Theme preference is set once and rarely changed (indicating the chosen theme works well in the user's environment)
- Language selection is changed on first use and then remains stable

**Where Friction Can Appear:**
- If role switching is happening multiple times per session, users may be confused about which experience applies to their current task
- If Light mode is frequently selected during peak daytime hours, it signals that the dark-mode futuristic design has legibility issues under outdoor sunlight

**UX Questions to Answer via Analytics:**
- How often is the theme toggled per session? At what time of day does it happen most?
- How often is role switching used, and does the user stay in the new role or switch back quickly?
- What percentage of users have changed their language setting?

---

## 6. Key User Flows & Drop-off Points

### Flow 1: Field Technician Completes a PM Inspection

This is the most important operational flow in the app. Tracking every stage lets us pinpoint exactly where time is lost or where users get stuck.

```
[Login & Select Field Role]
        ↓
[Open Work Tab or Map]
        ↓
[Select Work Order Card]
        ↓
[Accept Work Order]              ← Drop-off point: Rejection or Delay
        ↓
[Travel to Site / Geofence]      ← Drop-off point: GPS accuracy issues
        ↓
[Scan Asset (r-vision)]          ← Drop-off point: Scanner fallback to manual
        ↓
[Start Work]
        ↓
[Complete Checklist Items]       ← Drop-off point: Complex items (voltage, photos)
        ↓
[Submit for Review]              ← Drop-off point: Validation error → back to fix
        ↓
[Central Approves / Rejects]     ← Drop-off point: Rework loop
        ↓
[Completed ✓]
```

**Metrics to track at each stage:**
| Stage | Metric | Target |
|:---|:---|:---|
| Login to first work order opened | Time elapsed | < 60 seconds |
| Work order acceptance rate | Accepted / Total assigned | > 90% |
| Geofence compliance | Users within perimeter when work starts | > 85% |
| Scanner success rate | Camera scans / Total scanner sessions | > 90% |
| Checklist completion rate | Fully completed / Started | > 95% |
| First-attempt submission | Submitted without validation error | > 80% |
| Approval rate | Approved on first submission / Total submitted | > 90% |

---

### Flow 2: Central Team Dispatches a Work Order

```
[Login & Select Central Role]
        ↓
[View Work Feed or Dashboard]
        ↓
[Tap (+) to Create Work Order]   ← Drop-off point: Modal abandoned
        ↓
[Select Station & Charger]       ← Drop-off point: Station picker confusion
        ↓
[Choose Template or Custom]      ← Drop-off point: Template vs. scratch decision
        ↓
[Assign Technician & Due Date]
        ↓
[Publish Work Order]
        ↓
[Technician Accepts & Begins]    ← Drop-off point: Unaccepted orders aging in Assigned
```

**Metrics to track:**
| Stage | Metric | Target |
|:---|:---|:---|
| Modal abandonment rate | Dismissed without submitting / Total opens | < 15% |
| Station selection time | Time spent on station picker | < 20 seconds |
| Template usage rate | Template chosen / Total work orders created | > 80% |
| End-to-end creation time | (+) tapped to work order published | < 60 seconds |
| Time to accept | Work order assigned → technician accepts | < 2 hours |

---

## 7. Design Friction Signals to Monitor

These are UX "red flags" — observable patterns in usage data that indicate something in the design is confusing, unclear, or too difficult.

| Friction Signal | What It Looks Like in Data | Likely Design Problem | Design Action |
|:---|:---|:---|:---|
| **High validation error rate at submission** | Users hit Submit, get an error, and are sent back | Mandatory fields aren't visually distinguishable. Required status isn't clear at a glance. | Add required indicators inline. Show a live completion indicator (e.g. "18/24 done") above Submit. |
| **Frequent tab switching in checklist** | Users move between Overview, Tasks, Tools, Activity multiple times mid-execution | Context or task instructions are buried in a different tab. Users look for info that should be visible alongside the task. | Consider surfacing task notes and tool requirements inline within the checklist itself, not behind a separate tab. |
| **High scanner fallback to manual typing** | > 20% of scanner sessions end in CPID typed manually | Camera recognition is unreliable, the scan frame is too small, or barcode labels on real-world equipment are worn. | Increase the viewfinder area. Add real-time visual feedback when a barcode is partially in frame. |
| **Map skipped entirely by field users** | Users jump to Work tab without any map interaction | Map doesn't add value in the field user's daily routine. Stations are already known to the technician. | Consider making the map show live task proximity distances, which adds concrete value beyond passive discovery. |
| **Creation modal abandoned** | User opens (+) but closes without submitting | Form is too complex or time-consuming to fill mid-task. | Reduce required fields on creation. Let dispatchers create a draft with just Station + Type and fill the rest later. |
| **Notification ignored** | Notification is read but user does not navigate to the linked item | Message isn't compelling enough, or the link-through to the work order isn't obvious. | Make the work order title prominent in the notification description. Add a direct action button in the notification itself. |
| **Frequent role switching** | User switches role multiple times within a session | User doesn't understand which role they should be in, or the roles' feature sets are too different to recall. | Add a brief role description label to each role option. Consider persisting role as a preference unless explicitly changed. |
| **Dark mode toggled to light during peak day hours** | Mode switching happens 9am–5pm consistently | Dark cyberpunk UI has legibility problems under direct outdoor sunlight | Test against outdoor sunlight contrast. Raise minimum contrast ratios on body text and chip labels. |
| **High N/A usage on specific checklist items** | Certain items are N/A'd far more than others | Item may be irrelevant for certain charger types, or the item label is unclear | Review flagged items for clarity. Consider conditional visibility rules so items only appear when applicable. |

---

## 8. Measuring Design System Performance

The app uses a distinct Cyberpunk / Futuristic dark theme with neon accents, glass cards, and custom components. These need their own quality checks beyond standard usability.

### Custom Component Interaction Health

| Component | Where It Appears | What to Watch | Warning Sign |
|:---|:---|:---|:---|
| **Status filter tabs** (Work Feed) | Work Order Feed top of screen | How often each tab is used | A tab that is never selected should be removed or restructured |
| **Work order card** (Feed list) | Both Field and Central Feed | Whether inline actions (Accept/Reject) are used or ignored | Low inline action usage = users prefer full-screen before deciding |
| **Checklist section toggle** (Task screen) | Grouped sections like "Visual Inspection", "Electrical" | Whether sections are collapsed mid-checklist | If sections are collapsed, they may add cognitive noise without guiding the flow |
| **N/A toggle** (Checklist items) | Task detail screen, beside each item | Frequency per item | Any item N/A'd > 30% of the time needs redesign or conditional logic |
| **Station cluster pins** (Map) | Map screen | How often pins at the same cluster are tapped vs. using search | High search vs. direct pin taps = clustering UX needs improvement |
| **Floating Add button (+)** (Bottom nav) | All bottom-tab screens | Whether it's used as intended vs. accidentally tapped | High modal dismissal right after opening = accidental taps |
| **Bottom tab bar** | All main screens | Tab switching patterns | Tabs switched more than 5x per session = navigation confusion |

### Touch Ergonomics & Glove Accessibility

Field technicians use the app with work gloves. This creates specific constraints that need design analytics support:

- **Touch accuracy:** If taps are consistently registering on the wrong element (detectable through proximity of taps to nearest interactive element), interactive areas may need to be larger.
- **Thumb reach:** Critical actions (Submit, Accept, Start Work) should be in the bottom third of the screen — if data shows these are hard to reach, they're positioned too high.
- **One-handed scroll:** Checklist items that require two-handed interaction for complex input types (e.g. 4-field voltage matrix) may cause problems. Long session pauses on these items can flag this.

---

## 9. UX Success Metrics & Targets

The following metrics represent UX health for Iris R-One. These should be reviewed monthly by the product design team and triaged into design backlog items when targets are missed.

### Speed Metrics (Efficiency)

| Metric | Description | Target | Alert If |
|:---|:---|:---|:---|
| **Time to First Work Order** | Login → first work order detail viewed | < 60 seconds | > 2 minutes |
| **Checklist Completion Time** | Start Work → Submitted for Review | 15–35 minutes (PM) | > 60 minutes |
| **Work Order Creation Time** | (+) tapped → work order published | < 60 seconds | > 3 minutes |
| **Scan-to-Match Time** | Camera active → asset confirmed | < 5 seconds | > 15 seconds |

### Quality Metrics (Effectiveness)

| Metric | Description | Target | Alert If |
|:---|:---|:---|:---|
| **First-Attempt Submission Rate** | Submitted without hitting a validation error | > 80% | < 60% |
| **Approval Rate on First Submission** | Central approves without rework request | > 90% | < 75% |
| **Scanner Success Rate** | Barcodes resolved by camera (not manual entry) | > 90% | < 75% |
| **Checklist Completion Rate** | Started checklists that are fully submitted | > 95% | < 85% |

### Engagement Metrics (Adoption)

| Metric | Description | Target | Alert If |
|:---|:---|:---|:---|
| **Daily Active Users** | Users who open the app and take at least one action | Baseline + 10% MoM | Decline 2 weeks in a row |
| **Feature Adoption: r-vision** | % of jobs where scanner is used at least once | > 80% | < 50% |
| **Notification Action Rate** | Notifications that result in a work order being opened | > 60% | < 30% |
| **Template Usage Rate** | Work orders created using a template vs. from scratch | > 80% | < 50% |

### Satisfaction Signals (Happiness)

| Signal | How We Measure It | Target |
|:---|:---|:---|
| **Repeat daily usage** | Users who return on consecutive shifts | > 90% of active technicians |
| **Theme consistency** | Users who never toggle their theme (picked the right one first time) | > 80% |
| **Low error repetition** | Users who encounter a validation error but don't repeat it on the same screen | > 70% |

---

## 10. Where Analytics Surfaces Inside the App

Analytics in Iris R-One serves two purposes: **collecting behavioral data in the background** (invisible to users) and **surfacing operational insights visually within the app** (useful to users).

This section defines where and how UX analytics insights should be shown inside the app UI itself.

---

### For Central Team Users

**Location: Analytics / Fleet Insights Tab in Admin Navigation**

The Central Team navigation (`AdminTabs`) currently has Map, Work, Project, and Scan. An **Analytics tab** (or **Fleet Insights**) should be added as a 5th entry — this is the natural home for operational performance data that managers need daily.

What to show here:
- **PM Completion Rate** this week vs. last week
- **Work Orders by Status** (Assigned, Working, Under Review, Completed) in a visual summary
- **Average time from assigned to completed** per service type
- **Rejection rate** — how often submitted work is sent back for rework
- **Technician activity feed** — who completed what and when
- **Assets with overdue PMs** or open high-priority alerts

---

**Location: Central Team Dashboard (DashboardScreen)**

The repository already contains a futuristic `DashboardScreen` with a glowing status card ("SYSTEM ONLINE", "OPTIMAL"), active asset count, and pending tasks. This screen is currently disconnected from live data but is the ideal visual home for a **real-time command console** for operations managers.

What to connect here:
- Live asset fleet health (Healthy / Service Due / Offline counts)
- Pending work order count by priority
- Technicians currently active in the field (with last-known location status)
- Recent system alerts requiring central attention

---

**Location: Admin Team Screen — Stats Grid**

The existing `AdminTeamScreen` already renders a 4-box stats grid (Total PM, Requested, Pending, Done). This grid is the right pattern for **high-level PM analytics** at a glance. It should be expanded and connected to live data as the analytics layer matures.

---

### For Field Technicians

**Location: Profile Screen — Personal Performance Card**

Field technicians don't need fleet-wide data — they need a quick view of their own performance. A compact "My Performance" card should appear in `ProfileScreen` directly below the user avatar card, showing:

- **Work orders completed this week** (e.g. "8 of 10 assigned")
- **Average checklist completion time** compared to team average
- **Scanner success rate** — personal r-vision accuracy
- **Sync status** — "All records synced" or "3 items waiting for connection" (especially critical for offline field work)

This gives technicians a sense of their own operational health and builds habitual app engagement beyond just executing tasks.

---

### Summary: Analytics Placement Map

```
IRIS R-ONE APP
│
├── CENTRAL TEAM SHELL (AdminTabs)
│   ├── Map Tab ──────────────────── (No analytics UI needed here)
│   ├── Work Tab ─────────────────── (Work feed + status tabs = operational view)
│   ├── Project Tab ──────────────── (Project list + PM status grid on AdminTeamScreen)
│   ├── Scan Tab ─────────────────── (No analytics UI needed here)
│   └── [+] Analytics Tab ──────────── NEW: Fleet health, completion rates, rejections
│       └── Dashboard Screen ───────── Existing DashboardScreen — connect to live data
│
└── FIELD TEAM SHELL (BottomTabs)
    ├── Map Tab ──────────────────── (No analytics UI needed here)
    ├── Work Tab ─────────────────── (Work feed — operational, not analytical)
    ├── Scan Tab ─────────────────── (r-vision scanner — no analytics UI needed here)
    └── Profile Screen ─────────────── ADD: Personal performance card for field users
```

---

## 11. Standard Event Export Matrix (GA4 / Firebase Format)

The matrix below is also exported as a standalone reporting file in [`UIUX_ANALYTICS_EVENTS.md`](file:///Users/tim/Desktop/Iris%20Projects/r-one_mob/UIUX_ANALYTICS_EVENTS.md). It models a 30-day active fleet reporting window for the Iris R-One mobile application across both Field Technicians and Central Operations.

```csv
# ----------------------------------------
# Events: Event name
# ----------------------------------------
# 
# All Users
# Start date: 20260929
# End date: 20261026
Event name,Event count,Total users,Event count per active user,Total revenue
screen_view,82415,2890,28.517301038062283,0
map_interaction,76320,2615,29.18546845124283,0
user_engagement,51280,2780,18.446043165467626,0
notification_receive,32190,2480,12.97983870967742,0
taskDetailScreen,28410,2340,12.141025641025642,0
notification_dismiss,21450,1980,10.833333333333334,0
workScreen,18920,2510,7.5378486055776895,0
mapScreen,16480,2460,6.699186991869918,0
checklist_item_checked,15230,2180,6.986238532110091,0
splash_screen_visit,8340,2690,3.100371747211896,0
session_start,6890,2810,2.4519572953736653,0
work_order_card_clicked,6420,2230,2.8789237668161434,0
scan_btn_clicked,4910,1290,3.806201550387597,0
scanScreen,4430,1110,3.990990990990991,0
photo_upload_clicked,4120,1870,2.2032085561497327,0
accept_work_btn_clicked,3840,1920,2.0,0
add_btn_floating_clicked,3610,980,3.683673469387755,0
camera_capture_success,3580,1810,1.9779005524861878,0
voltage_input_entered,3340,1650,2.024242424242424,0
recenter_btn_clicked,3180,820,3.878048780487805,0
notification_foreground,2940,780,3.769230769230769,0
remarks_input_typed,2870,1540,1.8636363636363635,0
r_vision_camera_opened,2760,1080,2.5555555555555554,0
submit_for_review_clicked,2680,1740,1.5402298850574712,0
barcode_scanned,2590,1050,2.466666666666667,0
cpid_match_success,2410,1030,2.3398058252427183,0
station_pin_clicked,2340,940,2.4893617021276597,0
checklist_toggle_clicked,2280,1490,1.5302013422818792,0
station_card_swiped,2120,860,2.4651162790697674,0
projectDetailScreen,1980,1120,1.7678571428571428,0
tab_active_clicked,1870,1210,1.5454545454545454,0
first_open,1420,1380,1.0289855072463767,0
login_btn_clicked,1390,1140,1.219298245614035,0
otp_received,1320,1120,1.1785714285714286,0
login,1280,1110,1.1531531531531531,0
field_role_selected,1190,1050,1.1333333333333333,0
geofence_verified,1160,980,1.183673469387755,0
notificationScreen,1120,890,1.2584269662921349,0
assetDetailScreen,1080,720,1.5,0
profileScreen,1040,680,1.5294117647058822,0
directions_clicked,980,620,1.5806451612903225,0
tab_pending_clicked,960,710,1.352112676056338,0
mark_complete_btn_clicked,940,810,1.1604938271604937,0
notification_open,920,680,1.3529411764705883,0
station_search_clicked,890,440,2.022727272727273,0
create_task_screen,860,390,2.2051282051282053,0
checklist_na_toggled,840,560,1.5,0
adminTeamScreen,820,310,2.6451612903225805,0
roleSelectionScreen,810,750,1.08,0
torch_toggle_clicked,790,380,2.0789473684210527,0
return_to_tasks_clicked,760,590,1.288135593220339,0
appearance_mode_toggle,740,490,1.510204081632653,0
map_filter_applied,710,430,1.6511627906976745,0
dark_mode_selected,680,470,1.446808510638298,0
overview_tab_clicked,650,490,1.326530612244898,0
move_to_working_clicked,620,440,1.4090909090909092,0
tools_tab_clicked,590,420,1.4047619047619047,0
activity_tab_clicked,580,390,1.4871794871794872,0
station_dropdown_selected,560,320,1.75,0
service_type_selected,540,310,1.7419354838709677,0
pm_template_selected,510,290,1.7586206896551724,0
create_task_submit_clicked,480,280,1.7142857142857142,0
enter_cpid_manually,470,240,1.9583333333333333,0
asset_alerts_tab_clicked,450,290,1.5517241379310345,0
geofence_outside_warning,430,280,1.5357142857142858,0
central_role_selected,420,380,1.105263157894737,0
cpid_match_failed,410,230,1.782608695652174,0
singleProjectScreen,390,210,1.8571428571428572,0
tab_all_clicked,380,290,1.3103448275862069,0
recent_scans_clicked,360,210,1.7142857142857142,0
recent_asset_selected,340,200,1.7,0
asset_history_tab_clicked,320,210,1.5238095238095237,0
reject_work_btn_clicked,310,220,1.4090909090909092,0
specs_modal_opened,290,180,1.6111111111111112,0
notification_star_clicked,280,170,1.6470588235294117,0
request_pm_clicked,270,160,1.6875,0
light_mode_selected,260,210,1.2380952380952381,0
add_custom_task_clicked,250,140,1.7857142857142858,0
data_type_dropdown_selected,240,140,1.7142857142857142,0
project_info_clicked,230,150,1.5333333333333334,0
request_pm_submit,220,140,1.5714285714285714,0
pm_filter_applied,210,120,1.75,0
approve_pm_clicked,190,90,2.111111111111111,0
rework_request_clicked,180,85,2.1176470588235294,0
switch_role_clicked,175,130,1.3461538461538463,0
logout_button_clicked,170,135,1.2592592592592593,0
logout_function,165,130,1.2692307692307692,0
language_screen_visit,150,110,1.3636363636363635,0
language_selected,140,105,1.3333333333333333,0
take_live_clicked,130,70,1.8571428571428572,0
add_project_comment,125,65,1.9230769230769231,0
ocpp_logs_clicked,110,55,2.0,0
filter_cleared,95,60,1.5833333333333333,0
app_update,90,88,1.0227272727272727,0
resend_otp_clicked,85,60,1.4166666666666667,0
os_update,80,78,1.0256410256410255,0
login_failure,75,55,1.3636363636363635,0
camera_permission_denied,45,35,1.2857142857142858,0
otp_failure,40,30,1.3333333333333333,0
app_exception,28,19,1.4736842105263157,0
app_clear_data,15,12,1.25,0
```

---

*This document is a living specification. It should be updated each time a new screen is added, a major interaction pattern changes, or a new design question emerges from product. Metrics and targets should be reviewed and adjusted quarterly based on real usage data.*
