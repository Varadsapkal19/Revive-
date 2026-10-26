"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Fingerprint,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"credentials" | "phone" | "google">("credentials");

  // Tab 1: Credentials State
  const [loginId, setLoginId] = useState("aarav.sharma@acme.com");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);

  // Tab 2: Phone & OTP State
  const [phone, setPhone] = useState("+91 98201 48210");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // General State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("revive_token");
      if (token) {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.loginWithCredentials(loginId, password);
      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Authenticated. Entering workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.sendPhoneOtp(phone);
      setOtpSent(true);
      setSuccessMsg(`Code sent to ${phone}. (Demo code: ${res.demo_otp || "482190"})`);
      setCountdown(45);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch SMS code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.verifyPhoneOtp(phone, otpCode);
      if (res && res.access_token) {
        localStorage.setItem("revive_token", res.access_token);
        localStorage.setItem("revive_user", JSON.stringify(res.user));
        setSuccessMsg("Phone verified. Entering workspace...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification code incorrect or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.loginWithGoogle(
        "operator@acme.com",
        "Aarav Sharma",
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
      setErrorMsg(err.message || "Google Single Sign-On failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between items-center py-12 px-4 selection:bg-zinc-200">
      {/* Top Brand Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            R
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            REVIVE
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 bg-white border border-zinc-200/80 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Production</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-sm my-auto">
        <div className="bg-white border border-zinc-200/90 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] p-7 sm:p-8">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
              Sign in to Console
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Autonomous Razorpay Revenue Recovery
            </p>
          </div>

          {/* Minimalist Segmented Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100/80 rounded-xl mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab("credentials");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                activeTab === "credentials"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("phone");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                activeTab === "phone"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("google");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                activeTab === "google"
                  ? "bg-white text-zinc-900 font-semibold shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Google
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50/80 border border-red-100 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Password Form */}
          {activeTab === "credentials" && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Login ID / Email
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Phone OTP Form */}
          {activeTab === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 48210"
                  disabled={otpSent}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors disabled:bg-zinc-50 disabled:text-zinc-500"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-zinc-700">
                        6-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                        }}
                        className="text-[11px] text-zinc-500 hover:text-zinc-800"
                      >
                        Change number
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="482190"
                      className="w-full tracking-widest text-center font-mono font-medium text-sm bg-white border border-zinc-200 rounded-lg py-2 text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>SMS dispatched</span>
                    {countdown > 0 ? (
                      <span>Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-zinc-700 hover:underline font-medium"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Verify &amp; Enter</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 3: Google Single Sign-On */}
          {activeTab === "google" && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-zinc-500 text-center leading-relaxed mb-4">
                Single sign-on via Google Workspace or Razorpay OAuth identity.
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg text-xs font-medium transition-all border border-zinc-200/90 flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Quick Fill Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Demo Operator:</span>
            <button
              type="button"
              onClick={() => {
                setLoginId("aarav.sharma@acme.com");
                setPassword("admin123");
                setActiveTab("credentials");
              }}
              className="text-zinc-600 hover:text-zinc-900 font-mono font-medium hover:underline"
            >
              aarav.sharma@acme.com
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="w-full max-w-sm flex items-center justify-center gap-3 text-[11px] text-zinc-400">
        <span>Protected by 256-bit TLS</span>
        <span>&bull;</span>
        <span>SOC 2 Type II</span>
        <span>&bull;</span>
        <span>Razorpay Partner Node</span>
      </div>
    </div>
  );
}
