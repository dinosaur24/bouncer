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
  return `// app/layout.tsx
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
}`;
}
