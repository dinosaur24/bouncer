# Bouncer Pages Development - Design Document

**Date:** 2026-02-22
**Status:** Approved

## Overview

Build all remaining pages from `bouncer.pen` designs into the existing Next.js app. The codebase already has 9 pages built with established patterns (Tailwind v4, "use client" components, local mock data, lucide-react icons, Space Grotesk + Inter fonts). We need 13 more pages plus a settings refactor and component extraction.

## Decisions

- **Settings architecture:** Replace tabbed Settings page with separate sub-routes under `/dashboard/settings/*`
- **Auth pages:** Two separate routes (`/login`, `/signup`)
- **Onboarding:** Post-signup only flow at `/onboarding/1-4`, not accessible from settings
- **Data layer:** Continue with static mock data inline in each page
- **Responsive:** Every page must work on desktop (1440px) and mobile (390px) using `md:` breakpoints

## Route Structure

```
/                                ← Homepage (exists)
/login                           ← NEW
/signup                          ← NEW
/pricing                         ← NEW
/onboarding/1                    ← NEW: Company Profile
/onboarding/2                    ← NEW: Install Snippet
/onboarding/3                    ← NEW: Connect CRM
/onboarding/4                    ← NEW: Set Thresholds
/dashboard                       ← Overview (exists)
/dashboard/validations           ← (exists)
/dashboard/analytics             ← (exists)
/dashboard/sources               ← (exists)
/dashboard/integrations          ← (exists)
/dashboard/settings              ← REFACTOR: Profile-only
/dashboard/settings/billing      ← NEW
/dashboard/settings/team         ← NEW
/dashboard/settings/api          ← NEW
/dashboard/settings/scoring      ← NEW
/dashboard/settings/snippet      ← NEW
/dashboard/settings/docs         ← NEW
```

## Section 1: Component Extraction

Extract from `src/app/page.tsx` to avoid duplication on the Pricing page:

- **`src/components/Nav.tsx`** — Top navigation bar with logo, links (Features, Pricing, Docs), mobile hamburger menu, Login/Signup buttons
- **`src/components/Footer.tsx`** — Multi-column footer with Product, Company, Legal columns + social icons

Update `page.tsx` to import these instead of defining inline.

## Section 2: Auth Pages

### `/login`
- Standalone page (no dashboard sidebar)
- **Desktop:** Split layout — dark left panel (Bouncer logo, testimonial quote, avatar) + white right panel with sign-in form
- **Mobile:** Single column — Bouncer wordmark at top, form below
- Form fields: Google SSO button, "or" divider, Email input, Password input (with show/hide toggle)
- "Sign in" CTA button (dark/black)
- "Don't have an account? Sign up" link → `/signup`
- Matches mobile .pen design `kQxro`

### `/signup`
- Same split layout as login
- Right panel: "Create your account" heading, "Start validating leads in under 5 minutes" subtext
- Form: Google SSO button, "or" divider, Work email, Password (with show/hide)
- "Create account" CTA button
- "Already have an account? Log in" link → `/login`
- Matches desktop .pen design `dAASq`

## Section 3: Pricing Page

### `/pricing`
- Uses shared Nav + Footer components
- **Header:** "Simple, transparent pricing" + Monthly/Annual toggle
- **Pricing cards:** 4 tiers in a row (desktop), stacked (mobile)
  - Free ($0/mo): 250 validations, email signal only, 1 form source
  - Starter ($49/mo): 5,000 validations, all 4 signals, 3 sources, email support
  - Growth ($149/mo, POPULAR badge): 15,000 validations, all 4 signals, CRM integrations, priority support, custom score weights — highlighted with red border
  - Scale ($349/mo): 50,000 validations, everything in Growth + priority support, dedicated manager
- **Feature comparison table:** Rows for each feature, checkmarks/values per tier. Scrollable on mobile.
- **FAQ section:** 5 expandable FAQ items (reuse accordion pattern)
- **CTA banner:** Dark background, "Ready to clean up your leads?" + CTA button
- Matches .pen `Ou4Vi` (desktop) and `i4RTX` (mobile)

## Section 4: Onboarding Flow

### `/onboarding/layout.tsx`
- Clean white page, no sidebar
- Bouncer logo (red square + "Bouncer" text) top-left
- Step indicator: 4 numbered dots connected by a line, filled green up to current step
- Centered content area (max-width ~480px)

### `/onboarding/1` — Company Profile
- "Tell us about your company" heading + subtext
- Fields: Company name, Company website, Team size (dropdown: 1-10, 11-50, 51-200, 200+), Primary CRM (dropdown: HubSpot, Salesforce, Pipedrive, Other, None)
- "Continue" button (full-width, dark)

### `/onboarding/2` — Install Snippet
- "Install the snippet" heading + "Add this code to your website before the closing </head> tag"
- Tab bar: HTML | React | Next.js
- Dark code block with syntax-highlighted JavaScript snippet
- "Copy" button in code block corner
- "Test my installation" button with checkmark success state
- "Continue" button

### `/onboarding/3` — Connect CRM
- "Connect your CRM" heading + subtext
- 3 CRM option cards: HubSpot (with "Recommended" badge, pre-selected with red border), Salesforce, Pipedrive
- Each shows icon + name + description
- "Connect & continue" CTA button
- "Skip for now" text link below

### `/onboarding/4` — Set Thresholds
- "Set scoring thresholds" heading + subtext
- 3 colored range bars: Passed (green, 70-100), Borderline (yellow/orange, 40-69), Rejected (red, 0-39)
- "Block rejected leads" toggle with description
- "Finish setup" button

Mobile: Same content, full-width, slightly smaller padding.

## Section 5: Settings Refactor

### `/dashboard/settings/layout.tsx`
- Wraps all settings sub-pages
- Contains a secondary navigation (sidebar on desktop matching .pen design, or top links on mobile)
- Settings nav items: Profile, Team, Billing, API & Webhooks, Scoring Thresholds, Snippet Install, Documentation
- Active item highlighted
- Content area to the right of settings nav

### `/dashboard/settings/page.tsx` — Profile (refactored)
- Strip existing tabs (API Keys, Notifications, Billing)
- Keep: "Settings" heading, "Manage your account and preferences" subtext
- Profile Information form: First name, Last name, Email address, Company
- "Save changes" + "Cancel" buttons
- Notification preferences section: email toggles for various alerts
- Danger Zone: "Delete account" with red button + confirmation text

### `/dashboard/settings/billing`
- "Billing" heading + "Manage your plan and payments" subtext
- Current plan card: Growth Plan (Active green badge), $149/month, billing cycle dates, payment method (Visa ****4242)
- "Change plan" + "Cancel subscription" links
- Usage this period: progress bar showing 8,432 / 15,000 validations (56%)
- Invoices table: Date, Amount, Status (Paid badge), Download link
- 3 mock invoices

### `/dashboard/settings/team`
- "Team" heading + "Invite and manage team members"
- Invite form row: email input + role dropdown (Admin/Member/Viewer) + "Send invite" button
- Team members table: Member (avatar + name + email), Role, Status (Active/Pending badge), Joined date
- Mock data: Sara Martinez (Owner, Active), Matej Novak (Admin, Active), Marco Rossi (Member, Pending)

### `/dashboard/settings/api`
- "API & Webhooks" heading + "Manage API keys and configure webhooks"
- API Keys section: Live API Key (masked with copy button), Test API Key (visible with copy button), "Regenerate keys" button
- Webhooks section: Endpoint URL input, Events checkboxes (validation.completed, validation.failed, lead.scored, lead.blocked)
- "Save webhook" + "Send test event" buttons

### `/dashboard/settings/scoring`
- "Scoring Thresholds" heading + "Configure how leads are categorized based on their validation score"
- 3 score range bars with values: Passed (green, 70-100), Borderline (yellow, 40-69), Rejected (red, 0-39)
- "Block rejected leads" toggle + description
- Live Preview section: 3 stat cards (62% Passed, 24% Borderline, 14% Rejected) with colored backgrounds
- Custom rejection message textarea
- "Save thresholds" button

### `/dashboard/settings/snippet`
- "Install Snippet" heading + subtext
- Your snippet code block with copy button
- "Test my installation" button + success status ("Snippet detected on acme.com")
- Platform guides: tabs (HTML, React, WordPress, Webflow, Framer)
- 3-step numbered instructions

### `/dashboard/settings/docs`
- "Documentation" heading
- Left sidebar with doc categories: Getting Started (Quick Start Guide, Install Snippet, Connect Your CRM), API Reference (Authentication, Validate Endpoint, Webhooks), Scoring (How Scoring Works, Custom Thresholds)
- Main content area showing selected article
- Search bar at top
- Default view: "Install Snippet" article with step-by-step instructions and code examples
- Mobile: sidebar becomes a dropdown/accordion, content below

## Section 6: Dashboard Sidebar Update

Update `/dashboard/layout.tsx`:
- When user is on any `/dashboard/settings/*` route, highlight "Settings" in the sidebar
- The settings sub-navigation is handled by the settings layout, not the main sidebar
- No structural changes needed to the main sidebar — it already has a Settings link

## Implementation Order

1. Extract Nav + Footer components
2. Login + Signup pages
3. Pricing page
4. Onboarding flow (layout + 4 steps)
5. Settings layout + refactor settings page to Profile
6. Settings sub-pages: Billing, Team, API, Scoring, Snippet, Docs
7. Dashboard sidebar polish
8. Final responsive QA pass across all pages

## Patterns to Follow

- All pages: `"use client"` directive
- Styling: Tailwind classes, use existing CSS variables (`--color-brand`, `--color-dark`, `--color-gray`, `--color-border`, `--color-surface`, `--color-green`)
- Fonts: Space Grotesk for headings, Inter for body
- Icons: lucide-react
- Responsive: mobile-first with `md:` breakpoint, `hidden md:block` / `md:hidden` for variant content
- State: local useState for UI interactions
- Data: hardcoded mock arrays/objects at top of file
- Max width: `max-w-[1440px] mx-auto` for desktop containment
- Animations: use existing slideIn, fadeIn, scaleIn keyframes from globals.css
