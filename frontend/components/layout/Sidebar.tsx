"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Radar,
  Briefcase,
  PlayCircle,
  FlaskConical,
  ShieldCheck,
  FileText,
  Scale,
  Sparkles,
  Layers,
  KeyRound,
} from "lucide-react";

const navigation = [
  { name: "Revenue War Room", href: "/dashboard", icon: BarChart3 },
  { name: "Risk Radar", href: "/revenue-risk", icon: Radar },
  { name: "Recovery Cases", href: "/cases", icon: Briefcase },
  { name: "Batch Simulator", href: "/simulator", icon: PlayCircle },
  { name: "A/B Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Policy Center", href: "/policies", icon: ShieldCheck },
  { name: "Audit Ledger", href: "/audit", icon: FileText },
  { name: "Judge Mode", href: "/judge-mode", icon: Scale, badge: "Why This Action?" },
  { name: "Operator Login / SSO", href: "/login", icon: KeyRound },
];


export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-900 to-blue-600 flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">REVIVE</span>
          <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
            Razorpay Intel Layer
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Intelligence & Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Guardrail Invariant Footer Badge */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-900">Deterministic Guardrails</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Strict policy invariants enforced. 0% AI hallucination tolerance.
        </p>
      </div>
    </aside>
  );
}
