"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

export function PasswordInput({
  label = "Password",
  error,
  value = "",
  showStrength = false,
  className = "",
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const passwordStr = String(value || "");

  // Password strength calculation
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 12) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)) score += 1;
    return score;
  };

  const strengthScore = getStrength(passwordStr);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Enterprise"];
  const strengthColors = [
    "bg-[#C84B4B]",
    "bg-amber-400",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-[#23845B]"
  ];

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#202421] tracking-tight">
          {label}
        </label>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(!show)}
          className="text-[11px] font-medium text-[#77786F] hover:text-[#202421] transition-colors flex items-center gap-1"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{show ? "Hide" : "Show"}</span>
        </button>
      </div>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          className={`w-full bg-[#FFFDF7] border ${
            error ? "border-[#C84B4B] focus:border-[#C84B4B]" : "border-[#E7E3D8] focus:border-[#202421]"
          } rounded-xl px-3.5 py-2.5 text-xs text-[#202421] placeholder:text-[#77786F]/60 focus:outline-none transition-all shadow-xs ${className}`}
          {...props}
        />
      </div>

      {showStrength && passwordStr.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex gap-1 h-1 w-full bg-[#E7E3D8] rounded-full overflow-hidden">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-full flex-1 transition-all ${
                  lvl <= strengthScore ? strengthColors[strengthScore - 1] || "bg-[#23845B]" : "bg-transparent"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[#77786F]">
            <span>Strength: <strong className="text-[#202421]">{strengthLabels[strengthScore - 1] || "Weak"}</strong></span>
            <span>Min 12 chars required</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-[#C84B4B] font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
