"use client";

import { useEffect, useState } from "react";
import { FlaskConical, TrendingUp, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { Experiment } from "@/lib/types";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const data = await api.getExperiments();
        setExperiments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#777B76]">Hypothesis Testing</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#202522] flex items-center gap-2.5">
          <FlaskConical className="w-6 h-6 text-[#202522]" />
          A/B Experiments &amp; Statistical Rigor
        </h1>
        <p className="text-xs text-[#777B76] mt-0.5">
          Scientifically validating autonomous multi-channel recovery against traditional dunning schedules.
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#777B76]">
            <div className="w-5 h-5 border-2 border-[#E6E1D7] border-t-[#202522] rounded-full animate-spin mx-auto mb-2" />
            Loading experiments...
          </div>
        ) : (
          experiments.map((exp) => (
            <div key={exp.id} className="bg-[#FFFDF8] border border-[#E6E1D7] rounded-[24px] p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#E6E1D7]">
                <div>
                  <h3 className="font-bold text-base text-[#202522]">{exp.name}</h3>
                  <p className="text-xs text-[#777B76] mt-0.5">{exp.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                  {exp.status}
                </span>
              </div>

              {/* Two variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#F5F2E9]/60 border border-[#E6E1D7]">
                  <span className="text-[11px] font-bold text-[#777B76] uppercase tracking-wider">
                    Control Variant (A)
                  </span>
                  <div className="font-semibold text-sm text-[#202522] mt-1">{exp.baseline_action}</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-[#777B76]">
                      {exp.baseline_recovery_rate}%
                    </span>
                    <span className="text-xs text-[#777B76]">Win Rate</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#202522] ring-1 ring-[#FFD45C]">
                  <span className="text-[11px] font-bold text-[#202522] uppercase tracking-wider flex items-center justify-between">
                    <span>Treatment Variant (B)</span>
                    <span className="text-[10px] bg-[#FFD45C] text-[#202522] px-2 py-0.5 rounded-full font-extrabold">CHALLENGER</span>
                  </span>
                  <div className="font-bold text-sm text-[#202522] mt-1">{exp.treatment_action}</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-[#202522]">
                      {exp.treatment_recovery_rate}%
                    </span>
                    <span className="text-xs text-[#16A36A] font-bold">Win Rate</span>
                  </div>
                </div>
              </div>

              {/* Statistical Confidence Metrics */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-[#16A36A] font-extrabold">
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" /> Net Uplift: +{exp.net_uplift_pct}%
                </div>
                <div className="text-[#777B76]">
                  Sample Size: <span className="font-mono font-bold text-[#202522]">{exp.cases_count.toLocaleString()} cases</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#202522]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                  Statistically Significant (p-value &lt; {exp.p_value})
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
