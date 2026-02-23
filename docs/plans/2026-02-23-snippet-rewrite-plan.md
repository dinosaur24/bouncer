# Snippet Rewrite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make all user-facing code snippets consistent, correct, and dynamically populated with real form keys.

**Architecture:** Create a single `snippets.ts` module that generates snippet strings from a form key. All 3 consumer pages (snippet settings, onboarding, docs) import from it. The snippet settings page pulls the user's real form key from `SourcesContext`; other pages use a placeholder.

**Tech Stack:** Next.js, React, TypeScript

**Design doc:** `docs/plans/2026-02-23-snippet-rewrite-design.md`

---

### Task 1: Create snippet generator module

**Files:**
- Create: `src/lib/snippets.ts`

**Context:** This module is the single source of truth for all snippet code shown to users. The CDN URL is `https://cdn.bouncer.dev/v1/bouncer.js`. The attribute is `data-form-key` (matches `form_key` in the `/api/validate` endpoint). No `data-config` attribute (removed — only one mode exists).

**Step 1: Create `src/lib/snippets.ts`**

```ts
const CDN_URL = 'https://cdn.bouncer.dev/v1/bouncer.js';
const PLACEHOLDER_KEY = 'bnc_your_form_key';

export function getFormKeyOrPlaceholder(formKey?: string): string {
  return formKey || PLACEHOLDER_KEY;
}

export function getHtmlSnippet(formKey: string): string {
  return `<script
  src="${CDN_URL}"
  data-form-key="${formKey}"
  async>
</script>`;
}

export function getReactSnippet(formKey: string): string {
  return `import { useEffect } from "react";

export function BouncerValidation() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "${CDN_URL}";
    script.dataset.formKey = "${formKey}";
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return null;
}`;
}

export function getNextSnippet(formKey: string): string {
  return \`// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${CDN_URL}"
          data-form-key="${formKey}"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}\`;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/snippets.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/snippets.ts
git commit -m "feat: add snippet generator module (single source of truth)"
```

---

### Task 2: Rewrite snippet settings page

**Files:**
- Modify: `src/app/dashboard/settings/snippet/page.tsx` (lines 7-31 snippets object, entire component)

**Context:** This page is inside the dashboard layout which wraps `SourcesProvider`, so `useSources()` is available. Replace the inline `snippets` record with imports from `snippets.ts`. Pull the first active source's `snippetId` as the form key. If no sources exist, show the placeholder key.

**Step 1: Rewrite `src/app/dashboard/settings/snippet/page.tsx`**

Key changes:
- Remove the `snippets` record (lines 7-31)
- Import `{ getHtmlSnippet, getReactSnippet, getNextSnippet, getFormKeyOrPlaceholder }` from `@/lib/snippets`
- Import `{ useSources }` from `@/contexts/SourcesContext`
- In the component, derive the form key: `const activeSource = sources.find(s => s.status === 'Active'); const formKey = getFormKeyOrPlaceholder(activeSource?.snippetId);`
- Build snippets dynamically: `const snippets: Record<string, string> = { HTML: getHtmlSnippet(formKey), React: getReactSnippet(formKey), "Next.js": getNextSnippet(formKey) };`
- If no sources exist, show a small info banner below the code block: "This snippet uses a placeholder key. Create a source in Sources to get your real form key."

Everything else (tabs, copy button, test button, platform guides) stays the same.

**Step 2: Verify the page renders**

Run: `npm run dev` and visit `http://localhost:3000/dashboard/settings/snippet`
Expected: Code blocks show the new CDN URL, `data-form-key` attribute, no `data-config`. If user has sources, shows real key. If not, shows `bnc_your_form_key` with info banner.

**Step 3: Commit**

```bash
git add src/app/dashboard/settings/snippet/page.tsx
git commit -m "feat: snippet settings page uses generator module + dynamic form key"
```

---

### Task 3: Rewrite onboarding step 2

**Files:**
- Modify: `src/app/onboarding/2/page.tsx` (lines 8-46 snippets object)

**Context:** Onboarding is outside the dashboard layout, so `SourcesContext` is NOT available. Always use placeholder key. Replace inline snippets with imports from `snippets.ts`.

**Step 1: Rewrite `src/app/onboarding/2/page.tsx`**

Key changes:
- Remove the `snippets` object (lines 8-46)
- Import `{ getHtmlSnippet, getReactSnippet, getNextSnippet, getFormKeyOrPlaceholder }` from `@/lib/snippets`
- At top of component: `const formKey = getFormKeyOrPlaceholder();`
- Build snippets: `const snippets = { html: getHtmlSnippet(formKey), react: getReactSnippet(formKey), nextjs: getNextSnippet(formKey) };`
- The `Tab` type and all UI (tabs, copy, test, continue) stays the same

**Step 2: Verify the page renders**

Visit `http://localhost:3000/onboarding/2`
Expected: Shows placeholder key `bnc_your_form_key`, new CDN URL, no `data-config`

**Step 3: Commit**

```bash
git add src/app/onboarding/2/page.tsx
git commit -m "feat: onboarding snippet page uses generator module"
```

---

### Task 4: Rewrite docs page snippet

**Files:**
- Modify: `src/app/dashboard/settings/docs/page.tsx` (lines 62-70 inline HTML snippet)

**Context:** The docs page has a hardcoded HTML snippet inside JSX. Replace it with the generator. Since this is inside the dashboard layout, `SourcesContext` is available, but the docs page content is a static `articles` record defined outside the component. The simplest approach: use placeholder key in the static article content.

**Step 1: Rewrite `src/app/dashboard/settings/docs/page.tsx`**

Key changes:
- Import `{ getHtmlSnippet, getFormKeyOrPlaceholder }` from `@/lib/snippets`
- Replace the hardcoded snippet in the `install-snippet` article (lines 63-69) with: `{getHtmlSnippet(getFormKeyOrPlaceholder())}`
- Move the `articles` object inside the component if needed, OR keep it outside and call the function at module level (since the placeholder is a constant, this is fine)
- Add a note below the code block: "Replace the form key with your actual key from Settings → Sources."

**Step 2: Verify the page renders**

Visit `http://localhost:3000/dashboard/settings/docs`
Expected: "Install Snippet" article shows new snippet format with placeholder key

**Step 3: Commit**

```bash
git add src/app/dashboard/settings/docs/page.tsx
git commit -m "feat: docs page snippet uses generator module"
```

---

### Task 5: Show form key on source cards

**Files:**
- Modify: `src/app/dashboard/sources/page.tsx` (lines 126-201 source cards)

**Context:** Each source card shows title, status, description, stats, and last submission. The `snippetId` field exists on each source but is never displayed. Add the form key between the description and stats row, with a copy button.

**Step 1: Add form key display to source cards**

Inside the source card `<div>` (after the description `<p>` at ~line 150, before the stats row at ~line 153), add:

```tsx
{/* Form Key */}
<div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg">
  <code className="text-[12px] font-mono text-gray flex-1 truncate">
    {source.snippetId}
  </code>
  <button
    onClick={() => {
      navigator.clipboard.writeText(source.snippetId);
      addToast("Form key copied");
    }}
    className="text-gray hover:text-dark transition-colors shrink-0 cursor-pointer"
  >
    <Copy size={14} />
  </button>
</div>
```

Also add `Copy` to the lucide-react import at the top of the file.

**Step 2: Verify the page renders**

Visit `http://localhost:3000/dashboard/sources`
Expected: Each source card shows its form key (e.g., `bnc_a1b2...`) with a copy icon. Clicking copy shows "Form key copied" toast.

**Step 3: Commit**

```bash
git add src/app/dashboard/sources/page.tsx
git commit -m "feat: show form key with copy button on source cards"
```

---

### Task 6: Update mock data to match new format

**Files:**
- Modify: `src/lib/mock-data.ts` (line 188-191 `snippetId` values)

**Context:** The mock sources use fake snippet IDs like `snp_main`, `snp_demo`. These should match the real format: `bnc_` prefix followed by a hex string (see `src/app/api/forms/route.ts:24`).

**Step 1: Update mock snippet IDs**

Replace the `snippetId` values in `generateSources()`:
- `snp_main` → `bnc_7f3a9e2b1d4c6f80`
- `snp_demo` → `bnc_2e8b4a1c9d0f5e73`
- `snp_blog` → `bnc_5c1d8e4f2a7b0936`
- `snp_webinar` → `bnc_9a0e3b7c6d2f1845`

**Step 2: Commit**

```bash
git add src/lib/mock-data.ts
git commit -m "fix: use realistic bnc_ format for mock source snippet IDs"
```

---

### Task 7: Final verification

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Verify all 4 pages visually**

1. `http://localhost:3000/onboarding/2` — placeholder key, new CDN URL, no `data-config`
2. `http://localhost:3000/dashboard/settings/snippet` — dynamic key (or placeholder with banner), consistent across HTML/React/Next.js tabs
3. `http://localhost:3000/dashboard/settings/docs` — placeholder key with "replace" note
4. `http://localhost:3000/dashboard/sources` — form key visible on each card with copy button

**Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: snippet rewrite final polish"
```
