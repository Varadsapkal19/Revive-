"use client";

import React from "react";
import Link from "next/link";
import { AuthVisualPanel } from "./AuthVisualPanel";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F2E9] text-[#202421] p-3 sm:p-5 lg:p-7 flex items-center justify-center selection:bg-[#FFD45C] selection:text-[#202421]">
      <div className="w-full max-w-[1360px] min-h-[660px] lg:min-h-[740px] bg-[#FFFDF7] border border-[#E7E3D8] rounded-[28px] sm:rounded-[36px] shadow-[0_8px_40px_rgba(32,36,33,0.03)] p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        
        {/* Left Panel: Form & Brand (approx. 43% on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
          {/* Top Brand Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img src="/logo.svg" alt="REVIVE" className="w-9 h-9 rounded-2xl shadow-sm transition-transform group-hover:scale-105 shrink-0" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#202421] block leading-none">
                  REVIVE
                </span>
                <span className="text-[11px] font-medium text-[#77786F] block mt-1 tracking-tight">
                  Revenue Recovery Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Center Form Content Slot */}
          <div className="my-auto w-full py-4">
            {children}
          </div>

          {/* Bottom Security / Trust Indicator */}
          <div className="pt-6 border-t border-[#E7E3D8] flex items-center justify-between text-[11px] text-[#77786F]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#23845B]" />
              <span>TLS 1.3 &bull; SOC 2 Type II Encrypted</span>
            </div>
            <span className="font-medium text-[#202421]/60">Autonomous AI FinTech</span>
          </div>
        </div>

        {/* Right Panel: AI Visual Experience (approx. 57% on desktop) */}
        <div className="hidden lg:block lg:col-span-7 h-full">
          <AuthVisualPanel />
        </div>

      </div>
    </div>
  );
}
