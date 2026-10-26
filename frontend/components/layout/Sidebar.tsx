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
    <aside className="w-64 border-r border-zinc-200/90 bg-white flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-6 border-b border-zinc-200/80 gap-3">
        <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs tracking-wider">
          R
        </div>
        <div>
          <span className="font-semibold text-zinc-900 tracking-tight text-sm block">REVIVE</span>
          <span className="block text-[10px] font-medium text-zinc-400">
            Razorpay Autonomous
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Core Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-zinc-100 text-zinc-950 font-semibold"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Guardrail Status Footer Badge */}
      <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-zinc-800">Deterministic Guardrails</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-tight">
          Strict policy invariants enforced on all actions.
        </p>
      </div>
    </aside>
  );
}
