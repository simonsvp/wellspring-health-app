# WellSpring Test Plan

## 1. Purpose

This document describes the testing approach for the WellSpring health-improvement application. The goal is to confirm that the main wellness features are functional, usable, responsive, and secure before deployment.

## 2. Scope

### In scope

- Multi-page navigation
- Responsive desktop, tablet, and mobile layouts
- Focus timer controls and completed-session logging
- Healthy music catalogue and player controls
- Activity filtering and completion logging
- Herbs and tea information and safety notice
- Mood journal create, view, and delete operations
- User registration, login, logout, and profile
- Profile-image upload
- User and administrator authorization
- Supabase database, Row-Level Security, and Storage
- Demo mode when Supabase is not configured

### Out of scope for the first release

- Medical diagnosis or treatment recommendations
- Integration with wearable devices
- Payments and subscriptions
- Native Android or iOS applications

## 3. Test environments

| Environment | Browser / viewport | Purpose |
|---|---|---|
| Desktop | Chrome, latest stable, 1920 x 1080 | Primary functional testing |
| Desktop | Firefox, latest stable, 1366 x 768 | Cross-browser testing |
| Tablet | Chrome responsive mode, 768 x 1024 | Tablet layout testing |
| Mobile | Chrome responsive mode, 390 x 844 | Mobile layout and navigation |
| Production | Deployed public URL | Final smoke and deployment testing |

## 4. Entry and exit criteria

### Entry criteria

- The application starts with `npm run dev`.
- The production build passes with `npm run build`.
- Test data or demo mode is available.
- The planned feature is complete enough to test.

### Exit criteria

- All critical smoke tests pass.
- No open critical or high-severity defects remain.
- Responsive checks pass on desktop, tablet, and mobile.
- Authentication and authorization checks pass in the Supabase environment.
- Known lower-severity issues are documented.

## 5. Smoke test checklist

Run this checklist after every significant change.

- [ ] Home page loads without a console error.
- [ ] Main navigation opens every page.
- [ ] Mobile menu opens, closes, and highlights the active page.
- [ ] Focus timer starts, pauses, resets, and completes.
- [ ] Music catalogue displays all available tracks.
- [ ] Activity category filters return the correct cards.
- [ ] An activity can be marked as complete.
- [ ] Herbs page displays its medical safety notice.
- [ ] Journal entry can be created and deleted.
- [ ] User can register, sign in, and sign out.
- [ ] Non-admin user cannot access administrator functionality.
- [ ] Administrator can open the protected admin panel.
- [ ] Profile-image upload accepts an image file.
- [ ] Layout has no overlap or horizontal scrolling at mobile width.
- [ ] Production build completes successfully.

## 6. Core functional test cases

| ID | Area | Scenario | Expected result | Priority |
|---|---|---|---|---|
| NAV-001 | Navigation | Select each desktop navigation link | Correct page opens and active link is highlighted | High |
| NAV-002 | Navigation | Open and close the mobile menu | Menu changes state without covering inaccessible content | High |
| FOC-001 | Focus | Start a five-minute focus session | Timer begins counting down from 05:00 | High |
| FOC-002 | Focus | Pause and resume the timer | Countdown stops and continues from the same value | High |
| FOC-003 | Focus | Reset an active timer | Timer returns to the selected duration | Medium |
| MUS-001 | Music | Select a track play button | Selected card shows a playing state | Medium |
| ACT-001 | Activities | Filter by Cardio | Only Cardio activities are displayed | High |
| ACT-002 | Activities | Complete an activity | Button changes to Completed and log is saved | High |
| HER-001 | Herbs | Open the herbs page | Herb cards and safety disclaimer are visible | High |
| JOU-001 | Journal | Save a valid reflection | Reflection appears in recent notes | High |
| JOU-002 | Journal | Delete a reflection | Selected reflection is removed | High |
| AUT-001 | Authentication | Register with valid data | Account is created or confirmation message is shown | Critical |
| AUT-002 | Authentication | Log in with invalid credentials | Clear error is shown and access is denied | Critical |
| AUT-003 | Authentication | Log out | Session ends and Sign in is displayed | Critical |
| SEC-001 | Authorization | Regular user opens admin page | Admin content is denied | Critical |
| SEC-002 | Data security | User requests another user's journal rows | RLS returns no unauthorized records | Critical |
| STO-001 | Storage | Upload a supported profile image | Image is saved and profile is updated | High |
| RES-001 | Responsive | Check pages at 390 px width | No overlap or horizontal page scroll appears | High |

## 7. Exploratory testing charters

### First-time visitor

Explore the application as someone who has never used a wellness app. Check whether the purpose, next action, navigation, and demo mode are understandable without instructions.

### Interrupted focus session

Start a timer, pause it repeatedly, change browser tabs, resize the browser, and return. Look for inaccurate time, duplicate logs, or confusing button states.

### Privacy-focused user

Create journal entries and a profile image. Attempt to access private information while signed out and as another test account.

### Small-screen user

Use only a 390 px mobile viewport. Navigate through every page and operate all controls without increasing the width.

## 8. Defect severity

| Severity | Definition | Example |
|---|---|---|
| Critical | Security failure, data loss, or core app unavailable | User can read another user's journal |
| High | Main feature cannot be completed | Login or focus timer does not work |
| Medium | Feature works with a noticeable problem | Filter produces an incorrect extra result |
| Low | Cosmetic or minor usability issue | Small spacing inconsistency |

## 9. Test evidence

For every completed feature, record:

- Commit ID and tested build
- Test environment and browser
- Passed and failed test cases
- Screenshots for visual issues
- Console errors, if any
- GitHub issue link for every accepted defect

## 10. Release smoke report template

```text
Build / commit:
Environment:
Browser and viewport:
Tester:
Date:

Smoke result: PASS / FAIL
Passed:
Failed:
Blocked:
Open critical defects:
Notes:
```
