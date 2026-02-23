"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-row">
      {/* Left panel — testimonial (desktop only) */}
      <div className="hidden md:flex w-1/2 bg-dark flex-col items-center justify-center px-16">
        <div className="max-w-[420px] flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand" />
            <span className="font-heading text-lg font-semibold text-white">
              Bouncer
            </span>
          </div>

          {/* Testimonial */}
          <blockquote className="flex flex-col gap-6">
            <p className="italic text-white/80 text-base leading-relaxed">
              &ldquo;Bouncer cut our junk leads by 60% in the first month. Our
              SDRs finally trust the leads marketing sends over.&rdquo;
            </p>
            <footer className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white">
                Sara Chen
              </span>
              <span className="text-sm text-white/60">
                Marketing Ops Manager, Acme Corp
              </span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — signup form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        {/* Mobile wordmark */}
        <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-center py-6 bg-white z-10">
          <span className="font-heading text-lg font-semibold text-dark">
            Bouncer
          </span>
        </div>

        <div className="max-w-[400px] w-full flex flex-col gap-6 px-5 md:px-0 mt-16 md:mt-0">
          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-[28px] font-bold text-dark">
              Create your account
            </h1>
            <p className="text-sm text-gray">
              Start validating leads in under 5 minutes
            </p>
          </div>

          {/* Google SSO */}
          <button className="w-full border border-border flex items-center justify-center gap-2 py-2.5 cursor-pointer hover:bg-surface transition-colors">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-heading text-[13px] font-medium text-dark">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-gray text-xs">or</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Form */}
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Work email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-medium text-dark font-heading"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-medium text-dark font-heading"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-border px-4 py-2.5 text-[13px] text-dark font-heading bg-white focus:outline-none focus:border-dark transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-dark text-white font-heading text-[13px] font-medium py-2.5 cursor-pointer hover:bg-dark/90 transition-colors"
            >
              Create account
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-gray text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
