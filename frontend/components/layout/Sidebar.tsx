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
} from "lucide-react";

const navigation = [
  { name: "Revenue War Room", href: "/dashboard", icon: BarChart3 },
  { name: "Risk Radar", href: "/revenue-risk", icon: Radar },
  { name: "Recovery Cases", href: "/cases", icon: Briefcase },
  { name: "Batch Simulator", href: "/simulator", icon: PlayCircle },
  { name: "A/B Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Policy Center", href: "/policies", icon: ShieldCheck },
  { name: "Audit Ledger", href: "/audit", icon: FileText },
  { name: "Judge Mode", href: "/judge-mode", icon: Scale, badge: "Explain" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#E6E1D7] bg-[#FFFDF8] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#E6E1D7] gap-3">
        <img src="/logo.svg" alt="REVIVE" className="w-8 h-8 rounded-xl shadow-xs shrink-0" />
        <div>
          <span className="font-bold text-[#202522] tracking-tight text-sm block">REVIVE</span>
          <span className="block text-[10px] font-medium text-[#777B76]">
            Revenue Recovery Intelligence
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#777B76]">
          Core Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#F5F2E9] text-[#202522] font-semibold border-l-2 border-[#FFD45C] pl-2.5 shadow-2xs"
                  : "text-[#777B76] hover:text-[#202522] hover:bg-[#F5F2E9]/60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#202522]" : "text-[#777B76]"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FFFDF8] text-[#202522] border border-[#E6E1D7]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Guardrail Status Footer Badge */}
      <div className="p-4 border-t border-[#E6E1D7] bg-[#F5F2E9]/40 m-3 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse" />
          <span className="text-xs font-semibold text-[#202522]">Deterministic Guardrails</span>
        </div>
        <p className="text-[11px] text-[#777B76] leading-relaxed">
          Strict policy invariants enforced on all actions.
        </p>
      </div>
    </aside>
  );
}
