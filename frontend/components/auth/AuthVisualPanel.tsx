"use client";

import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Shield,
  ArrowUpRight,
  Activity,
  Layers
} from "lucide-react";

export function AuthVisualPanel() {
  return (
    <div className="relative w-full h-full min-h-[580px] lg:min-h-[700px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#1C211E] via-[#242A27] to-[#171B19] p-8 lg:p-12 flex flex-col justify-between text-white select-none border border-black/10 shadow-inner">
      {/* Editorial Background Lighting & Geometric Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFD45C]/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(#FFF 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90">
          <span className="w-2 h-2 rounded-full bg-[#23845B] animate-pulse" />
          <span>Multi-Agent Triage Grid</span>
        </div>
        <div className="text-right text-[11px] text-white/50 font-mono tracking-wider">
          NODE: REVIVE_PROD_1
        </div>
      </div>

      {/* Center Interactive Glass Cards Cluster */}
      <div className="relative z-10 my-auto py-6 space-y-4">
        {/* CARD 1 — AI RECOVERY ENGINE */}
        <div className="animate-float backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-white/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFD45C] text-[#202421] flex items-center justify-center font-bold shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight text-white">AI Recovery Engine</h4>
                <p className="text-[10px] text-white/60">Autonomous Closed-Loop Pipeline</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#23845B]/20 text-[#4ADE80] border border-[#23845B]/40 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-white/50 block">Payment Signals Analyzed</span>
              <span className="font-mono font-bold text-sm text-white">14,820</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/50 block">Autonomous Recovery</span>
              <span className="font-mono font-bold text-sm text-[#FFD45C]">68.4%</span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Card 2 & Card 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 2 — REVENUE RECOVERY (Analytics Mini Chart) */}
          <div className="animate-float-slow backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#FFD45C]" />
                Recovery Lift
              </span>
              <span className="text-[10px] font-mono text-[#4ADE80] font-bold bg-[#23845B]/20 px-1.5 py-0.5 rounded">
                +34.8%
              </span>
            </div>

            {/* Clean Mini Sparkline SVG */}
            <div className="h-12 w-full my-1 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 35" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD45C" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#FFD45C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,28 Q15,24 25,18 T50,15 T75,8 T100,2 L100,35 L0,35 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,28 Q15,24 25,18 T50,15 T75,8 T100,2"
                  fill="none"
                  stroke="#FFD45C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[10px] text-white/50 tracking-tight">Net ARR Recaptured vs Baseline</span>
          </div>

          {/* CARD 3 — PAYMENT STATUS (Pipeline Flow) */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] space-y-2">
            <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#FFD45C]" />
              Payment Monitoring
            </span>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span>1. Payment Failed (Timeout)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <span>2. AI Diagnostician Triage</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#4ADE80] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                <span>3. Smart Recovery Dispatched</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4 — AI AGENT STATUS BAR */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/15 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#FFD45C]" />
              Governed Multi-Agent Graph
            </span>
            <span className="text-[10px] text-[#FFD45C] font-mono">5/5 Coordinated</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
            <div className="bg-white/5 rounded-lg py-1.5 border border-white/10">
              <span className="block font-semibold text-white">Sentinel</span>
              <span className="text-[9px] text-[#4ADE80]">Monitoring</span>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5 border border-white/10">
              <span className="block font-semibold text-white">Diagnost</span>
              <span className="text-[9px] text-blue-300">Analyzing</span>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5 border border-white/10">
              <span className="block font-semibold text-white">Strategist</span>
              <span className="text-[9px] text-amber-300">Evaluating</span>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5 border border-white/10">
              <span className="block font-semibold text-white">Executor</span>
              <span className="text-[9px] text-purple-300">Governed</span>
            </div>
            <div className="bg-white/5 rounded-lg py-1.5 border border-white/10">
              <span className="block font-semibold text-white">Auditor</span>
              <span className="text-[9px] text-emerald-300">Immutable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Quote / Testimonial */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
        <p className="italic font-normal">
          &ldquo;Autonomous revenue recapture with deterministic financial safety.&rdquo;
        </p>
        <span className="font-mono text-[10px] text-white/40 tracking-wider">REVIVE ENGINE</span>
      </div>
    </div>
  );
}
