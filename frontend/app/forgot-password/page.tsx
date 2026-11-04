"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSubmitted(true);
      if (data.debug_reset_token) {
        setDebugToken(data.debug_reset_token);
      }
    } catch (err: any) {
      // Return generic message to prevent account enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77786F] hover:text-[#202421] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202421] tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-xs sm:text-sm text-[#77786F] mt-1.5 leading-relaxed">
            Enter your registered email to receive password reset instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-[#C84B4B]/10 border border-[#C84B4B]/20 text-[#C84B4B] text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#202421] tracking-tight">
                Registered Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#FFFDF7] border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2.5 text-xs text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full mt-2 py-3 px-5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202421] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(255,212,92,0.3)] hover:shadow-[0_4px_16px_rgba(255,212,92,0.4)] disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-[#202421]/30 border-t-[#202421] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4 text-[#202421]" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 p-5 bg-[#23845B]/10 border border-[#23845B]/20 rounded-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-[#23845B] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Reset link dispatched</span>
            </div>
            <p className="text-xs text-[#202421] leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure single-use password reset link has been dispatched.
            </p>

            {debugToken && (
              <div className="p-3 bg-white rounded-xl border border-[#23845B]/30 text-xs">
                <span className="block text-[10px] uppercase font-bold text-[#77786F] mb-1">
                  Local Sandbox Reset Link:
                </span>
                <Link
                  href={`/reset-password?token=${debugToken}`}
                  className="font-mono text-[#202421] font-semibold underline break-all"
                >
                  Proceed to Reset Password &rarr;
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#202421] hover:underline"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
