"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("aarav.sharma@acme.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  // Multi-factor authentication step state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.loginWithCredentials(email, password, totpCode || undefined);
      
      if (res && res.mfa_required) {
        setMfaRequired(true);
        setSuccessMsg("MFA required: Please enter the 6-digit code from your authenticator app.");
        setLoading(false);
        return;
      }

      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Authenticated successfully. Redirecting to workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid login credentials. Please verify and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.loginWithGoogle(
        "operator@enterprise.io",
        "Aarav Sharma",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
      );
      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Google Workspace authorized. Entering workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google Single Sign-On failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Main Heading & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202421] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-[#77786F] mt-1.5 leading-relaxed">
            Sign in to your intelligence workspace and take control of your revenue recovery.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-[#C84B4B]/10 border border-[#C84B4B]/20 text-[#C84B4B] text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-[#23845B]/10 border border-[#23845B]/20 text-[#23845B] text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {!mfaRequired ? (
            <>
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#202421] tracking-tight">
                  Email Address
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

              {/* Password */}
              <PasswordInput
                label="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#77786F] cursor-pointer select-none hover:text-[#202421] transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-[#E7E3D8] text-[#202421] focus:ring-0 focus:outline-none accent-[#202421]"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="font-medium text-[#202421] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            /* MFA Verification Step */
            <div className="space-y-3 p-4 bg-[#F5F2E9]/60 border border-[#E7E3D8] rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-[#202421]">
                <KeyRound className="w-4 h-4 text-[#202421]" />
                <span>Two-Factor Authentication</span>
              </div>
              <p className="text-[11px] text-[#77786F]">
                Enter the 6-digit verification code from your authenticator app or an 8-character backup recovery code.
              </p>
              <input
                type="text"
                required
                autoFocus
                maxLength={9}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.trim())}
                placeholder="e.g. 704961 or xxxx-xxxx"
                className="w-full bg-white border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2.5 text-center font-mono font-bold text-sm tracking-widest text-[#202421] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setMfaRequired(false)}
                className="text-[11px] text-[#77786F] hover:text-[#202421] underline"
              >
                Back to credentials
              </button>
            </div>
          )}

          {/* Submit Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202421] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(255,212,92,0.3)] hover:shadow-[0_4px_16px_rgba(255,212,92,0.4)] disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#202421]/30 border-t-[#202421] rounded-full animate-spin" />
            ) : (
              <>
                <span>{mfaRequired ? "Verify Code & Sign In" : "Sign In to Workspace"}</span>
                <ArrowRight className="w-4 h-4 text-[#202421]" />
              </>
            )}
          </button>
        </form>

        {/* Social SSO Options */}
        <SocialAuthButtons onGoogleLogin={handleGoogleLogin} loading={loading} />

        {/* Registration Link */}
        <div className="mt-6 text-center text-xs text-[#77786F]">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="font-bold text-[#202421] hover:underline"
          >
            Create account
          </Link>
        </div>

        {/* Quick Fill Credentials Helper for Demo Operators */}
        <div className="mt-5 p-3 rounded-xl bg-[#F5F2E9]/70 border border-[#E7E3D8] flex items-center justify-between text-[11px] text-[#77786F]">
          <span>Demo Operator:</span>
          <button
            type="button"
            onClick={() => {
              setEmail("aarav.sharma@acme.com");
              setPassword("••••••••••••");
            }}
            className="font-mono font-medium text-[#202421] hover:underline"
          >
            aarav.sharma@acme.com
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
