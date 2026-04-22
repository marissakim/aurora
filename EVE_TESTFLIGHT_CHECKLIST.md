# Eve → TestFlight Checklist

30 days from Day 1 to TestFlight. Check items off as you complete them. Items marked **[YOU]** require you to act; the rest are for our coding sessions.

---

## Pre-flight (do anytime before Day 1)

- [ ] **[YOU]** Confirm you have an iPhone running iOS 17+
- [ ] **[YOU]** Have ~$300 ready (Apple $99 + Termly $10/mo + Claude API ~$200)
- [ ] **[YOU]** Block ~10–15 hrs/wk on your calendar for the next 4 weeks
- [ ] **[YOU]** Confirm your Apple ID email + password (you'll use it for Apple Developer)

---

## Week 1 — Setup + Design system + Entry flows

### Day 1 (~1 hr you, kickoff session with me)
- [ ] **[YOU]** Enroll in Apple Developer Program at https://developer.apple.com/programs/ ($99/yr, 24–48 hr verification)
- [ ] **[YOU]** Open Mac App Store, search "Xcode", click Get/Install (~30 GB, run overnight)
- [ ] **[YOU]** Install Expo Go on your iPhone from the App Store (free)
- [ ] Together: scaffold `eve-mobile/` Expo project, install dependencies, push to new GitHub repo

### Day 2 (~1.5 hr)
- [ ] Port `theme.js`
- [ ] Set up StyleSheet pattern
- [ ] **[YOU]** First `npm start` — confirm blank app on Expo Go on your iPhone

### Day 3 (~1.5 hr)
- [ ] Port `EveLogo.jsx` → `react-native-svg`
- [ ] Port leaf-sway + entry animations to `react-native-reanimated`

### Day 4 (~1.5 hr)
- [ ] Port UI primitives: `Card`, `StatusBadge`, `ProgressRing`, `MiniSparkline`

### Day 5 (~1.5 hr)
- [ ] Port `LandingPage` with `LinearGradient`
- [ ] **[YOU]** See branded landing page on your iPhone

### Day 6 (~2 hr)
- [ ] Port `Onboarding`

### Day 7 (~2 hr)
- [ ] Port `BiomarkerIntake` (3 sub-views)
- [ ] Port `AddBiomarkersModal`
- **End-of-week check:** complete onboarding → add biomarkers → see blank dashboard

---

## Week 2 — All tabs rendering

### Day 8 (~1.5 hr)
- [ ] Dashboard shell + `@react-navigation/bottom-tabs`
- [ ] Top nav with wordmark + avatar menu

### Day 9 (~2 hr)
- [ ] `MyIndex`: Eve Score ring, score breakdown, Quick Actions

### Day 10 (~2 hr)
- [ ] AI Analysis section (mock only)
- [ ] Key Insights cards
- [ ] Start Here virtual care card

### Day 11 (~2 hr)
- [ ] `Biomarkers` tab: empty state + populated state
- [ ] Rebuild biomarker trend chart in `react-native-svg`

### Day 12 (~2 hr)
- [ ] `Pathways` tab including 40+ action-cards view

### Day 13 (~2 hr)
- [ ] `FindClinics` tab: filters, clinic cards, directories
- [ ] Replace `<a href>` with `Linking.openURL()`

### Day 14 (~2 hr)
- [ ] `Costs` tab with custom bar chart
- **End-of-week check:** all 6 tabs render with real content on your iPhone

---

## Week 3 — Plan + Persistence + Polish

### Day 15 (~2 hr)
- [ ] `MyPlan` tab: kit status banner, pathway badge, phased timeline

### Day 16 (~1.5 hr)
- [ ] `useAsyncStorage` hook
- [ ] Wire profile / biomarkers / completed tasks / selected pathway through

### Day 17 (~1 hr)
- [ ] Copy `aiInsightsMock.js`, `planComposer.js`, `scoring.js` (no changes)

### Day 18 (~1 hr)
- [ ] Strip Eve Kit purchase UI → informational cards
- [ ] Cofertility modal → external link

### Day 19 (~1.5 hr)
- [ ] Accessibility: VoiceOver labels, font scaling, safe-area insets

### Day 20 (~2 hr)
- [ ] **[YOU]** Full-session test on real iPhone
- [ ] Fix visual bugs together

### Day 21 (~1 hr)
- [ ] Animation polish (entry + leaf sway on iOS)
- **End-of-week check:** complete a full session on iPhone, refresh persists, Start Over clean

---

## Week 4 — App Store submission

### Day 22 (~1.5 hr)
- [ ] I generate app icon SVG (1024×1024) from EveLogo
- [ ] **[YOU]** Convert SVG → PNG at 1024×1024 (Preview app, "Export As", PNG)
- [ ] I write `app.json` with bundle ID `com.eve.fertility`
- [ ] Configure `expo-splash-screen`

### Day 23 (~2 hr)
- [ ] **[YOU]** Create app in App Store Connect: https://appstoreconnect.apple.com/
- [ ] **[YOU]** Fill metadata (name, subtitle, category)
- [ ] I draft 4000-char description + keywords (100 char) + age rating notes
- [ ] **[YOU]** Sign up for Termly ($10/mo) at https://termly.io/, generate privacy policy
- [ ] **[YOU]** Push privacy policy as `privacy.html` to your `aurora` GitHub repo (will be live at marissakim.github.io/aurora/privacy.html)
- [ ] **[YOU]** Paste privacy policy URL into App Store Connect

### Day 24 (~1.5 hr)
- [ ] **[YOU]** Take screenshots from your iPhone:
  - [ ] Landing page
  - [ ] Onboarding question (mid-flow)
  - [ ] My Index dashboard with Eve Score
  - [ ] My Plan tab
  - [ ] Find Clinics with Virtual Care
- [ ] (Optional) Add device frames at https://screenshots.pro/ or https://previewed.app/
- [ ] **[YOU]** Upload screenshots to App Store Connect

### Day 25 (~1 hr)
- [ ] Run `npx eas-cli build:configure`
- [ ] Run `eas build --platform ios --profile preview` (~15–20 min in cloud)
- [ ] **[YOU]** Smoke-test the .ipa

### Day 26 (~1 hr)
- [ ] Run production build: `eas build --platform ios --profile production`
- [ ] Run `eas submit --platform ios`
- [ ] **[YOU]** In App Store Connect → TestFlight, add yourself as Internal Tester
- [ ] **[YOU]** Accept the TestFlight invite email

### Day 27 (~1 hr)
- [ ] **[YOU]** Install via TestFlight app on iPhone
- [ ] **[YOU]** Run through every flow
- [ ] Fix any crashes / iOS-specific issues together

### Day 28 (~30 min)
- [ ] **[YOU]** In App Store Connect → TestFlight, submit for **External Review** (24–48 hr Apple turnaround)
- [ ] **[YOU]** Fill in External Test Information (what to test, contact email)

### Day 29 (buffer)
- [ ] If Apple Reviewer asks a question: I draft response, **[YOU]** paste it into App Store Connect
- [ ] Most common asks pre-empted by:
  - Privacy nutrition label saying "no health data leaves device"
  - Disclaimer in app: "AI-generated decision support, not medical diagnosis"

### Day 30
- [ ] **[YOU]** External TestFlight approved
- [ ] **[YOU]** Add 3–5 trusted testers via email in App Store Connect
- [ ] **[YOU]** Send each tester the TestFlight install link
- [ ] **[YOU]** Set up a feedback channel (shared Notion, Google Form, or just email)

---

## Post-launch (Day 31+)

- [ ] **[YOU]** Watch first feedback flow in
- [ ] Decide v0.2 priorities — likely candidates:
  - [ ] Real Claude integration (Worker already exists)
  - [ ] Real Eve Kit checkout (Stripe)
  - [ ] Push notifications
  - [ ] Account login + cloud sync
  - [ ] Android port

---

## If something slips

- Week 1 or 2 slip by >2 days: **cut scope** (defer one tab or animation polish), don't slip Week 4
- Apple Developer verification stuck >5 days: contact Apple support
- TestFlight rejection: address feedback, resubmit (1–2 days each round)
- You're hitting >15 hrs/wk consistently: tell me — we'll cut Day-by-Day scope to keep you sane

---

## What I'll need from you on Day 1 to start

Just say "**let's start Day 1**" and we'll go. By that point you should have:
- [ ] Apple Developer enrollment submitted (verification can be in-flight)
- [ ] Xcode downloading or downloaded
- [ ] Expo Go on your iPhone

If you don't have any of those done yet, no problem — we can do them together at the start of the Day 1 session.
