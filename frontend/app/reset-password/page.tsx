"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!token) {
      setErrorMsg("Missing password reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Password reset failed.");
      }

      setSuccessMsg("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Token may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Reset your password
        </h1>
        <p className="text-xs sm:text-sm text-[#77786F] mt-1.5 leading-relaxed">
          Choose a strong, compliant password for your REVIVE account.
        </p>
      </div>

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

      <form onSubmit={handleReset} className="space-y-4">
        {/* Token field */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#202421] tracking-tight">
            Reset Token
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your reset token"
            className="w-full bg-[#FFFDF7] border border-[#E7E3D8] focus:border-[#202421] rounded-xl px-3.5 py-2 text-xs font-mono text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs"
          />
        </div>

        {/* New Password */}
        <PasswordInput
          label="New Password"
          required
          showStrength
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min 12 characters with symbol & number"
        />

        {/* Confirm New Password */}
        <PasswordInput
          label="Confirm New Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your new password"
        />

        <button
          type="submit"
          disabled={loading || !newPassword || !confirmPassword || !token}
          className="w-full mt-2 py-3 px-5 bg-[#FFD45C] hover:bg-[#F4C64C] text-[#202421] font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(255,212,92,0.3)] hover:shadow-[0_4px_16px_rgba(255,212,92,0.4)] disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-[#202421]/30 border-t-[#202421] rounded-full animate-spin" />
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight className="w-4 h-4 text-[#202421]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-[#E7E3D8] border-t-[#202421] rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
