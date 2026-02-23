# Snippet Rewrite Design

**Date:** 2026-02-23
**Status:** Approved
**Scope:** Fix snippets only (no snippet.js runtime)

## Problem

The code snippets shown to Bouncer users are inconsistent, use fake data, and don't match the actual backend API:

1. **Naming mismatch** — Snippets use `data-token` but the API expects `form_key`
2. **Fake token** — All snippets hardcode `bnc_sk_abc0ef` instead of the user's real form key
3. **Meaningless attribute** — `data-config="auto_validate"` has no alternative modes
4. **Inconsistent code** — Settings page React snippet missing `data-config`, Next.js snippet is a bare JSX fragment (not a valid component)
5. **Duplicated definitions** — Same snippets defined in 3 files (7 hardcoded token references)
6. **Form key not visible** — Sources page never shows the form key users need for their snippet

## Design

### 1. Snippet Attributes

| Attribute | Before | After | Rationale |
|-----------|--------|-------|-----------|
| `src` | `cdn.bouncer.io/snippet.js` | `cdn.bouncer.dev/v1/bouncer.js` | Versioned URL |
| `data-token` | `bnc_sk_abc0ef` | `data-form-key` with real key | Matches `form_key` in `/api/validate` |
| `data-config` | `auto_validate` | Removed | Only one mode exists |

### 2. Corrected Snippet Variants

**HTML:**
```html
<script
  src="https://cdn.bouncer.dev/v1/bouncer.js"
  data-form-key="bnc_a1b2c3d4e5f67890"
  async>
</script>
```

**React:**
```tsx
import { useEffect } from "react";

export function BouncerValidation() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.bouncer.dev/v1/bouncer.js";
    script.dataset.formKey = "bnc_a1b2c3d4e5f67890";
    script.async = true;
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return null;
}
```

**Next.js:**
```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.bouncer.dev/v1/bouncer.js"
          data-form-key="bnc_a1b2c3d4e5f67890"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```

### 3. Single Source of Truth

Create `src/lib/snippets.ts` that exports snippet-generating functions:

```ts
export function getHtmlSnippet(formKey: string): string
export function getReactSnippet(formKey: string): string
export function getNextSnippet(formKey: string): string
```

All 3 consumer pages import from this module.

### 4. Dynamic Form Key

- **Snippet settings page:** Pull the user's first active source `form_key` from `SourcesContext`. If no sources exist, show placeholder `bnc_your_form_key` with a prompt to create a source.
- **Onboarding step 2:** Show placeholder `bnc_your_form_key` since users haven't created sources yet.
- **Docs page:** Show placeholder with note to copy real key from Settings → Snippet.

### 5. Sources Page — Display Form Key

Add the form key (`snippetId`) to each source card with a copy button so users can find and copy their key.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/snippets.ts` | **New** — snippet generator functions |
| `src/app/dashboard/settings/snippet/page.tsx` | Import from snippets.ts, use dynamic form key from context |
| `src/app/onboarding/2/page.tsx` | Import from snippets.ts, use placeholder key |
| `src/app/dashboard/settings/docs/page.tsx` | Import from snippets.ts, use placeholder key |
| `src/app/dashboard/sources/page.tsx` | Show form key on source cards with copy button |
