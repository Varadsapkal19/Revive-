"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setErrorMsg("Please accept the terms and security policies.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.register({
        name: fullName,
        email: email,
        password: password,
        merchant_name: companyName || undefined,
      });

      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Account created successfully! Entering intelligence workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.loginWithGoogle(
        "operator_new@enterprise.io",
        fullName || "Enterprise Lead",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
      );
      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Google Workspace authorized. Entering workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Main Heading & Subtitle */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202421] tracking-tight">
            Create your REVIVE account
          </h1>
          <p className="text-xs sm:text-sm text-[#77786F] mt-1.5 leading-relaxed">
            Start building smarter payment recovery workflows.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#C84B4B]/10 border border-[#C84B4B]/20 text-[#C84B4B] text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#23845B]/10 border border-[#23845B]/20 text-[#23845B] text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#202421] tracking-tight">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              className="w-full bg-[#FFFDF7] border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2 text-xs text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Work Email */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#202421] tracking-tight">
              Work Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-[#FFFDF7] border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2 text-xs text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Company / Merchant Name */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#202421] tracking-tight">
              Company / Merchant Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Financial Technologies"
              className="w-full bg-[#FFFDF7] border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2 text-xs text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Password with Strength Indicator */}
          <PasswordInput
            label="Password"
            required
            showStrength
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 12 characters with symbol & number"
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />

          {/* Terms & Conditions Acceptance */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#77786F] cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded-md border-[#E7E3D8] text-[#202421] focus:ring-0 focus:outline-none accent-[#202421]"
              />
              <span className="leading-tight">
                I agree to the REVIVE Security Policy and Enterprise Terms of Service.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202421] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(255,212,92,0.3)] hover:shadow-[0_4px_16px_rgba(255,212,92,0.4)] disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#202421]/30 border-t-[#202421] rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 text-[#202421]" />
              </>
            )}
          </button>
        </form>

        {/* Social SSO Options */}
        <SocialAuthButtons onGoogleLogin={handleGoogleSignup} loading={loading} />

        {/* Sign In Link */}
        <div className="mt-5 text-center text-xs text-[#77786F]">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="font-bold text-[#202421] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
