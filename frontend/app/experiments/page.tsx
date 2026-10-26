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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-blue-600" />
          A/B Experiments & Statistical Rigor
        </h1>
        <p className="text-sm text-slate-500">
          Scientifically validating autonomous multi-channel recovery against traditional dunning schedules.
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading experiments...</div>
        ) : (
          experiments.map((exp) => (
            <div key={exp.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{exp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{exp.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {exp.status}
                </span>
              </div>

              {/* Two variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Control Variant (A)
                  </span>
                  <div className="font-semibold text-sm text-slate-800 mt-1">{exp.baseline_action}</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {exp.baseline_recovery_rate}%
                    </span>
                    <span className="text-xs text-slate-500">Win Rate</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    Treatment Variant (B)
                  </span>
                  <div className="font-semibold text-sm text-blue-900 mt-1">{exp.treatment_action}</div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-blue-700">
                      {exp.treatment_recovery_rate}%
                    </span>
                    <span className="text-xs text-blue-600 font-semibold">Win Rate</span>
                  </div>
                </div>
              </div>

              {/* Statistical Confidence Metrics */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <TrendingUp className="w-4 h-4" /> Net Uplift: +{exp.net_uplift_pct}%
                </div>
                <div className="text-slate-500">
                  Sample Size: <span className="font-mono font-semibold text-slate-800">{exp.cases_count.toLocaleString()} cases</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
