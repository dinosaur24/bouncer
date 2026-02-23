import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-dark flex-col justify-between p-10 md:p-16">
        <div className="max-w-[420px] flex flex-col gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand rounded-md" />
            <span className="font-heading text-lg font-semibold text-white">
              Bouncer
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
              Stop junk leads before they hit your CRM
            </h1>
            <p className="text-base text-white/60 leading-relaxed">
              Real-time multi-signal lead validation. Catch fake emails, invalid phones, risky IPs, and ghost companies.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 Bouncer. All rights reserved.</p>
      </div>

      {/* Right — Clerk sign in */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full max-w-[400px]',
              card: 'shadow-none border-0',
            }
          }}
        />
      </div>
    </div>
  );
}
