# Bouncer Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all 13 remaining pages from the bouncer.pen designs plus refactor Settings into sub-routes.

**Architecture:** Next.js App Router with "use client" pages, Tailwind v4 styling, local mock data, lucide-react icons. Mobile-first responsive with `md:` breakpoints. No backend — pure frontend prototype.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react

**Reference designs:** Screenshots from `/Users/dinosakoman/Documents/bouncer.pen` (use pencil MCP tools to view)

---

### Task 1: Extract Nav component

**Files:**
- Create: `src/components/Nav.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create Nav.tsx**

Extract the `Nav` function (lines 129-216 of `src/app/page.tsx`) into `src/components/Nav.tsx`. Add `"use client"` directive and required imports (`useState`, `Link`, `Menu`, `X` from lucide-react). Export as named export.

Update nav links: change "Login" href from `/dashboard` to `/login`, "Start for free" href to `/signup`. Change "Pricing" href from `#pricing` to `/pricing`.

**Step 2: Update page.tsx**

Replace the inline `Nav` function in `src/app/page.tsx` with `import { Nav } from "@/components/Nav"`. Remove the now-unused `Menu` and `X` imports from page.tsx if no other component uses them.

**Step 3: Verify**

Run: `npm run build` — should compile without errors.

---

### Task 2: Extract Footer component

**Files:**
- Create: `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create Footer.tsx**

Extract the `Footer` function (lines 722-815 of `src/app/page.tsx`) into `src/components/Footer.tsx`. Add `"use client"` and `Link` import. Export as named export.

Update footer links: "Pricing" href to `/pricing`, "Docs" href to `/dashboard/settings/docs`, "API" href to `/dashboard/settings/api`.

**Step 2: Update page.tsx**

Replace inline `Footer` with import from `@/components/Footer`.

**Step 3: Verify**

Run: `npm run build` — should compile without errors.

---

### Task 3: Login page

**Files:**
- Create: `src/app/login/page.tsx`

**Step 1: Build login page**

Reference the .pen design `kQxro` (Mobile Login) and `dAASq` (desktop — note: the desktop .pen shows signup, so adapt the layout for sign-in).

Structure:
```
"use client"
- Desktop: flex row, min-h-screen
  - Left panel (hidden md:flex, w-1/2): bg-dark, Bouncer logo, testimonial quote, avatar
  - Right panel (w-full md:w-1/2): centered form card (max-w-[400px])
- Mobile: single column, Bouncer wordmark centered at top
- Form: Google SSO button, "or" divider, email input, password input (with Eye/EyeOff toggle), "Sign in" button
- Footer link: "Don't have an account? Sign up" → /signup
```

Use exact design tokens: `bg-dark` for left panel, `font-heading` for headings, `text-[13px]` for labels, `border-border` for inputs, `bg-dark text-white` for submit button.

**Step 2: Verify**

Run: `npm run dev` — navigate to `/login`, check desktop and mobile (resize browser). Compare against .pen screenshot.

---

### Task 4: Signup page

**Files:**
- Create: `src/app/signup/page.tsx`

**Step 1: Build signup page**

Same split layout as login. Reference .pen design `dAASq`.

Differences from login:
- Heading: "Create your account"
- Subtext: "Start validating leads in under 5 minutes"
- Fields: "Work email" (not just "Email"), Password
- Button: "Create account"
- Footer: "Already have an account? Log in" → /login
- Left panel: same testimonial + avatar

**Step 2: Verify**

Run: `npm run dev` — navigate to `/signup`, check both viewports.

---

### Task 5: Pricing page

**Files:**
- Create: `src/app/pricing/page.tsx`

**Step 1: Build pricing page**

Reference .pen designs `Ou4Vi` (desktop) and `i4RTX` (mobile). Uses Nav + Footer components.

Structure:
```
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"

- Nav
- Header: "Simple, transparent pricing" centered, Monthly/Annual toggle
- 4 pricing cards in grid (md:grid-cols-4, mobile: stacked)
  - Free $0, Starter $49, Growth $149 (POPULAR, red border-top), Scale $349
  - Each: name, price, features list with Check icons, CTA button
  - Growth card: ButtonCTA, others: ButtonSecondary
- Feature comparison table: rows for each feature, columns per plan
  - Mobile: horizontally scrollable with overflow-x-auto
- FAQ section: 5 accordion items (reuse FAQItem pattern from page.tsx — copy inline)
- Dark CTA banner: "Ready to clean up your leads?"
- Footer
```

Monthly/Annual toggle: useState, when Annual selected show prices * 10 (yearly) with "Save 17%" badge.

**Step 2: Verify**

Run: `npm run dev` — navigate to `/pricing`, verify all 4 cards, comparison table, FAQ, responsive layout.

---

### Task 6: Onboarding layout

**Files:**
- Create: `src/app/onboarding/layout.tsx`

**Step 1: Build onboarding layout**

Clean wrapper with no sidebar. Reference .pen designs `9QSGI` through `BtZWR`.

```tsx
"use client"
import { usePathname } from "next/navigation"

- White background, min-h-screen
- Top bar: Bouncer logo (red square + text) left-aligned, p-6 md:p-8
- Step indicator: 4 circles connected by lines
  - Derive current step from pathname (/onboarding/1 → step 1)
  - Completed steps: bg-green, current: bg-dark with number, future: bg-border
- Centered content area: max-w-[480px] mx-auto, px-5 md:px-0
- {children}
```

**Step 2: Verify**

Run: `npm run build` — should compile.

---

### Task 7: Onboarding Step 1 — Company Profile

**Files:**
- Create: `src/app/onboarding/1/page.tsx`

**Step 1: Build step 1**

Reference .pen `9QSGI` and `EEU90`.

```
"use client"
- Heading: "Tell us about your company"
- Subtext: "This helps us tailor Bouncer to your needs."
- Fields:
  - Company name (text input, placeholder "Acme Corp.")
  - Company website (text input, placeholder "https://acme.com")
  - Team size + Primary CRM side by side on desktop, stacked on mobile
    - Team size: select dropdown (1-10, 11-50, 51-200, 200+)
    - Primary CRM: select dropdown (HubSpot, Salesforce, Pipedrive, Other, None)
- "Continue" button (full-width, bg-dark) → Link to /onboarding/2
```

Input styling: match existing pattern — `border border-border px-4 py-2.5 text-[13px] font-heading focus:outline-none focus:border-dark`.

Select styling: same as input + `appearance-none` with ChevronDown icon overlay.

**Step 2: Verify**

Run: `npm run dev` — navigate to `/onboarding/1`, check form layout on both viewports.

---

### Task 8: Onboarding Step 2 — Install Snippet

**Files:**
- Create: `src/app/onboarding/2/page.tsx`

**Step 1: Build step 2**

Reference .pen `mlNm8` and `TJ4jb`.

```
"use client"
- Heading: "Install the snippet"
- Subtext: "Add this code to your website before the closing </head> tag."
- Tab bar: HTML | React | Next.js (useState for active tab)
- Code block: bg-dark text-green-400, p-5, font-mono text-[13px]
  - Show different snippet per tab
  - "Copy" button top-right (Copy icon from lucide, onClick copies to clipboard)
- "Test my installation" button (border style) with CheckCircle success state
- "Continue" button (full-width, bg-dark) → /onboarding/3
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/onboarding/2`, verify tab switching, copy button, responsive.

---

### Task 9: Onboarding Step 3 — Connect CRM

**Files:**
- Create: `src/app/onboarding/3/page.tsx`

**Step 1: Build step 3**

Reference .pen `JoaUe` and `0Ezdh`.

```
"use client"
- Heading: "Connect your CRM"
- Subtext: "Bouncer will push validated leads directly to your CRM."
- 3 CRM cards (stacked vertically):
  - HubSpot: orange H icon, "Connect to HubSpot account", "Recommended" badge, pre-selected
  - Salesforce: blue S icon, "Connect to Salesforce account"
  - Pipedrive: dark P icon, "Connect to Pipedrive account"
- Selected card: border-brand (red border), others: border-border
- useState for selectedCRM
- "Connect & continue" button (full-width, bg-dark) → /onboarding/4
- "Skip for now" text link below → /onboarding/4
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/onboarding/3`, verify card selection, responsive.

---

### Task 10: Onboarding Step 4 — Set Thresholds

**Files:**
- Create: `src/app/onboarding/4/page.tsx`

**Step 1: Build step 4**

Reference .pen `BtZWR` and `fBZyE`.

```
"use client"
- Heading: "Set scoring thresholds"
- Subtext: "Define what qualifies as a Passed, Borderline, or Rejected lead."
- 3 score ranges (each with colored indicator dot + label + range):
  - Passed: green dot, "70 — 100", green gradient bar
  - Borderline: yellow/orange dot, "40 — 69", yellow/orange gradient bar
  - Rejected: red dot, "0 — 39", red gradient bar
- Each bar: full-width colored bar segment showing the range
- "Block rejected leads" toggle + description text
- "Finish setup" button (full-width, bg-dark) → /dashboard
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/onboarding/4`, verify bars, toggle, responsive.

---

### Task 11: Settings layout with sub-navigation

**Files:**
- Create: `src/app/dashboard/settings/layout.tsx`
- Modify: `src/app/dashboard/layout.tsx` (update Settings active detection)

**Step 1: Create settings layout**

Reference .pen designs for settings pages — they show a left sidebar with doc-style nav within the main content area.

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Users, CreditCard, Code, Sliders, Terminal, BookOpen } from "lucide-react"

const settingsNav = [
  { label: "Profile", href: "/dashboard/settings", icon: User },
  { label: "Team", href: "/dashboard/settings/team", icon: Users },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
  { label: "API & Webhooks", href: "/dashboard/settings/api", icon: Code },
  { label: "Scoring Thresholds", href: "/dashboard/settings/scoring", icon: Sliders },
  { label: "Snippet Install", href: "/dashboard/settings/snippet", icon: Terminal },
  { label: "Documentation", href: "/dashboard/settings/docs", icon: BookOpen },
]

Layout:
- Desktop: flex row
  - Left nav: w-[200px] shrink-0, list of links with icon + label
    - Active: font-medium text-dark with brand indicator
    - Inactive: text-gray
  - Right content: flex-1 {children}
- Mobile: nav hidden, content full-width (sub-pages will have back navigation)
```

**Step 2: Update dashboard layout**

In `src/app/dashboard/layout.tsx`, update the Settings nav item active detection to match any path starting with `/dashboard/settings`:

Change line 43-45 from:
```tsx
const isActive = item.href === "/dashboard"
  ? pathname === "/dashboard"
  : pathname.startsWith(item.href);
```

This already works correctly since `/dashboard/settings` is the href and `pathname.startsWith` will match sub-routes. No change needed unless it doesn't work. Verify.

**Step 3: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings`, verify settings sub-nav appears alongside the main sidebar.

---

### Task 12: Refactor Settings page to Profile-only

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx`

**Step 1: Refactor**

Remove the tab system and the Billing/Notifications tab content. Keep:
- Page header ("Settings" heading + subtext)
- Profile form (firstName, lastName, email, company)
- Save/Cancel buttons
- Danger Zone section
- Delete account modal

Remove: `tabs` array, `activeTab` state, tab row JSX, `{activeTab === "Notifications"}` section, `{activeTab === "Billing"}` section, unused imports (`Lock`, `Bell`, `CreditCard`).

The settings sub-navigation is now handled by the settings layout.

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings`, verify Profile form shows without tabs.

---

### Task 13: Billing settings page

**Files:**
- Create: `src/app/dashboard/settings/billing/page.tsx`

**Step 1: Build billing page**

Reference .pen `j82Y4` (desktop) and `4lJJR` (mobile).

```
"use client"
- Heading: "Billing" + "Manage your plan and payments"
- Current plan card (border border-border p-6):
  - Row: "Growth Plan" + Active badge (bg-green/10 text-green text-xs px-2 py-0.5)
  - Price: "$149/month"
  - Details: billing cycle dates, payment method (Visa ****4242)
  - "Change plan" link + "Cancel subscription" link (text-brand)
- Usage section:
  - "Usage this period" heading
  - Large number: "8,432" + "/ 15,000" in gray
  - Progress bar: w-full h-2 bg-surface, inner bg-brand at 56%
- Invoices table:
  - Columns: Date, Amount, Status, Action
  - 3 rows: Feb 15 2026 $149 Paid, Jan 15 2026 $149 Paid, Dec 15 2025 $149 Paid
  - Status: green "Paid" badge
  - Action: "Download" link
- Mobile: same content, single column, smaller padding
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/billing`, check both viewports.

---

### Task 14: Team Management settings page

**Files:**
- Create: `src/app/dashboard/settings/team/page.tsx`

**Step 1: Build team page**

Reference .pen `LrP7q` (desktop) and `js1aQ` (mobile).

```
"use client"
- Heading: "Team" + "Invite and manage team members"
- Invite form row:
  - Desktop: flex row — email input (flex-1) + role dropdown (w-[140px]) + "Send invite" button
  - Mobile: stacked — email, role dropdown, button
- Team members table:
  - Header row: Member, Role, Status, Joined
  - Data rows:
    - Sara Martinez (sara@acme.com) | Owner | Active (green badge) | Jun 15, 2025
    - Matej Novak (matej@acme.com) | Admin | Active (green badge) | Jan 12, 2026
    - Marco Rossi (marco@acme.com) | Member | Pending (yellow badge) | Invited Feb 23
  - Each member row: avatar circle (initials, bg-dark text-white) + name/email
  - Mobile: card layout instead of table — each member as a card with stacked info
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/team`, check both viewports.

---

### Task 15: API & Webhooks settings page

**Files:**
- Create: `src/app/dashboard/settings/api/page.tsx`

**Step 1: Build API page**

Reference .pen `NXliX` (desktop) and `OPhg4` (mobile).

```
"use client"
- Heading: "API & Webhooks" + "Manage API keys and configure webhooks"
- API Keys section:
  - "Live API Key" label + masked input (sk_live_••••••••••••••••) + Copy button
  - "Test API Key" label + visible input (sk_test_cJRz5s4e9fg7a9f7) + Copy button
  - "Regenerate keys" button (text-brand link style)
- Webhooks section (mt-10):
  - "Webhooks" heading
  - "Receive real-time notifications when validation events occur"
  - Endpoint URL input (placeholder: https://api.acme.com/webhooks)
  - Events to subscribe: 4 checkboxes
    - validation.completed (checked, brand colored square)
    - validation.failed (checked, brand colored square)
    - lead.scored (unchecked)
    - lead.blocked (unchecked)
  - "Save webhook" button (bg-dark) + "Send test event" button (border style)
```

Copy button: onClick → navigator.clipboard.writeText, show brief "Copied!" toast or inline feedback.

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/api`, check both viewports.

---

### Task 16: Scoring Thresholds settings page

**Files:**
- Create: `src/app/dashboard/settings/scoring/page.tsx`

**Step 1: Build scoring page**

Reference .pen `4kRIP` (desktop) and `kPAi6` (mobile).

```
"use client"
- Heading: "Scoring Thresholds" + "Configure how leads are categorized based on their validation score"
- Description text about score ranges
- 3 score range rows:
  - Each: colored dot + label + gradient bar + range text
  - Passed: green (#22C55E), bar from 70-100, "70 — 100"
  - Borderline: orange (#F59E0B), bar from 40-69, "40 — 69"
  - Rejected: red (#E42313), bar from 0-39, "0 — 39"
  - Gradient bars: full-width colored bars showing the range proportion
- "Block rejected leads" toggle (same toggle pattern as notifications):
  - Label + description text
  - useState for toggle state
- Live Preview section:
  - "Live preview — Last 100 validations"
  - 3 stat cards side by side:
    - 62% Passed (green-tinted bg)
    - 24% Borderline (yellow-tinted bg)
    - 14% Rejected (red-tinted bg)
- Custom rejection message textarea
- "Save thresholds" button (bg-dark)
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/scoring`, check both viewports.

---

### Task 17: Snippet Install settings page

**Files:**
- Create: `src/app/dashboard/settings/snippet/page.tsx`

**Step 1: Build snippet page**

Reference .pen `IDKLc` (desktop) and `P4fgZ` (mobile).

```
"use client"
- Heading: "Install Snippet" + "Add the Bouncer JavaScript snippet to your website to start validating leads in real time."
- Your snippet code section:
  - Tab bar: HTML | React | Next.js (same pattern as onboarding step 2)
  - Dark code block with snippet
  - Copy button
- Verification:
  - "Test my installation" button with CheckCircle
  - Success state: "Snippet detected on acme.com" (green text + checkmark)
- Platform guides section:
  - Tabs: HTML | React | WordPress | Webflow | Framer
  - 3-step numbered instructions per platform:
    1. Copy the snippet code above
    2. Paste before the closing </head> tag (or framework-specific instruction)
    3. Verify the installation
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/snippet`, check both viewports.

---

### Task 18: In-app Documentation settings page

**Files:**
- Create: `src/app/dashboard/settings/docs/page.tsx`

**Step 1: Build docs page**

Reference .pen `CWUWd` (desktop) and `q4hDG` (mobile).

```
"use client"
- Desktop layout: flex row
  - Left sidebar (w-[200px]): doc categories as collapsible sections
    - Getting Started: Quick Start Guide, Install Snippet, Connect Your CRM
    - API Reference: Authentication, Validate Endpoint, Webhooks
    - Scoring: How Scoring Works, Custom Thresholds
  - Right content: selected article
- Mobile layout:
  - Search bar at top
  - Category sections stacked with chevron disclosure
  - Each doc item as a row with chevron-right
- Default selected article: "Install Snippet" from Getting Started
- Article content: heading, description paragraphs, numbered steps, code blocks
- Search bar: text input with Search icon, filters doc items (useState)
```

Mock article content for "Install Snippet":
```
# Install Snippet
Add Bouncer's JavaScript snippet to your website...

## 1. Copy the snippet code
...
## 2. Paste before the closing </head> tag
...
## 3. Verify the installation
...
```

**Step 2: Verify**

Run: `npm run dev` — navigate to `/dashboard/settings/docs`, check both viewports.

---

### Task 19: Update dashboard layout for mobile

**Files:**
- Modify: `src/app/dashboard/layout.tsx`

**Step 1: Add mobile navigation**

The current dashboard layout has a desktop-only sidebar with no mobile equivalent. Add a mobile top bar + bottom tab navigation:

```
- Mobile top bar (md:hidden):
  - Hamburger menu + "Bouncer" centered + notification/profile icon
  - Height: ~56px, border-b
- Mobile bottom nav (md:hidden, fixed bottom):
  - 5 tabs: Overview, Log (Validations), Analytics, Sources, Settings
  - Each: icon + label, active state with brand color
  - Matches .pen mobile dashboard designs
- Hide desktop sidebar on mobile: add "hidden md:flex" to aside
```

**Step 2: Verify**

Run: `npm run dev` — resize to mobile width, verify bottom nav appears and sidebar hides.

---

### Task 20: Final build verification

**Step 1: Build check**

Run: `npm run build` — ensure zero TypeScript/compilation errors across all new pages.

**Step 2: Visual QA checklist**

Navigate through every new page at both desktop (1440px) and mobile (390px) widths:

- [ ] `/login` — split layout desktop, single column mobile
- [ ] `/signup` — split layout desktop, single column mobile
- [ ] `/pricing` — 4 cards, comparison table, FAQ, CTA
- [ ] `/onboarding/1` — form with dropdowns, step indicator
- [ ] `/onboarding/2` — code block, tab switching, copy button
- [ ] `/onboarding/3` — CRM cards, selection state
- [ ] `/onboarding/4` — score bars, toggle
- [ ] `/dashboard/settings` — Profile form, settings sub-nav
- [ ] `/dashboard/settings/billing` — plan card, usage bar, invoices
- [ ] `/dashboard/settings/team` — invite form, members table
- [ ] `/dashboard/settings/api` — API keys, webhook config
- [ ] `/dashboard/settings/scoring` — score bars, live preview
- [ ] `/dashboard/settings/snippet` — code block, verification
- [ ] `/dashboard/settings/docs` — sidebar nav, article content

Compare each against the .pen design screenshots using `mcp__pencil__get_screenshot`.
