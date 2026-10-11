import { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Shield,
  Check,
  X,
  FileSpreadsheet,
  FileText,
  Clock,
  Layers,
  Zap,
  Lock,
  GitBranch,
} from 'lucide-react';
import { serviceFeatures, type ServiceFeature } from '@/content';

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState<string>(serviceFeatures[0].id);
  const activeService = serviceFeatures.find((s) => s.id === activeTab) || serviceFeatures[0];

  return (
    <section id="services" className="py-24 lg:py-32 bg-slate-50/70 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            Core Architecture & Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            Engineered to <span className="gradient-text">Protect Your CRM</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Unlike legacy tools that blindly overwrite records like a wrecking ball, Veracity operates as an air-gapped pre-ingestion staging layer with mathematical proof, privacy locks, and constant-time rollback.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 mb-12 gap-2 no-scrollbar">
          <div className="inline-flex p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            {serviceFeatures.map((service) => {
              const Icon = service.icon;
              const isActive = service.id === activeTab;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                  {service.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Service Content Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 lg:p-12 transition-all">
          {/* Service Title Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">
                {activeService.subheadline}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {activeService.headline}
              </h3>
            </div>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 self-start lg:self-center px-4.5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              Get Started ($65/mo)
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Problem vs Solution Split */}
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/70">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                <span className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center text-xs text-rose-800 font-extrabold">✕</span>
                The Legacy Problem (The Wrecking Ball)
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeService.problem}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200/70">
              <div className="flex items-center gap-2 text-sky-800 font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5 text-sky-600" />
                The Veracity Standard (The Air-Gapped Firewall)
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activeService.solution}
              </p>
            </div>
          </div>

          {/* Pipeline Flow Visualization */}
          <div className="my-10 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/90 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pipeline Execution Architecture
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Deterministic · In-Memory
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeService.pipelineSteps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-primary-300 hover:shadow-xs transition-all">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 mb-1.5">
                    <span className="w-5 h-5 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center text-[10px] font-bold border border-primary-200/60">
                      {idx + 1}
                    </span>
                    {step.step}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed pl-7">
                    {step.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Architectural Pillars */}
          <div className="my-10">
            <h4 className="text-xl font-bold text-slate-900 mb-6">
              Deep Technical Pillars &amp; Invariants
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              {activeService.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-primary-200 hover:shadow-xs transition-all"
                >
                  <h5 className="text-base font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h5>
                  <p className="text-xs text-slate-600 mb-3.5 leading-relaxed">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2">
                    {pillar.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Comparison Table (Dedup & Merge) */}
          {activeService.comparison && (
            <div className="my-10">
              <h4 className="text-xl font-bold text-slate-900 mb-4">
                Competitive Showdown: Legacy Tools vs. Veracity
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-bold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">Capability</th>
                      <th className="py-3.5 px-4 font-semibold text-slate-700">Legacy Tools (Insycle / DemandTools)</th>
                      <th className="py-3.5 px-4 font-bold text-primary-900 bg-primary-50/70 border-l border-primary-100">Veracity Data Engine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeService.comparison.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{row.feature}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200/60 flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-3 h-3 text-rose-500" />
                            </span>
                            <span>{row.legacy}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 bg-primary-50/20 border-l border-primary-100">
                          <div className="flex items-start gap-2.5 text-slate-900 font-semibold">
                            <span className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </span>
                            <span>{row.veracity}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deliverables Box */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              What the Client Receives at the End of a Run
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {activeService.deliverables.map((del, dIdx) => (
                <div key={dIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />
                  <span>{del}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Founding Member Notice Banner */}
          <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
                  Exclusive Founder&apos;s Advantage
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                  10 Founding Members receive <strong className="text-slate-900 font-semibold">all upcoming Enterprise Add-Ons free for life</strong> on the locked founder charter: Direct CRM Push, Mass Bulk Orchestration, Lead-to-Account Routing, and Visual UI Cockpit.
                </div>
              </div>
            </div>
            <a
              href="#pricing"
              className="shrink-0 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Claim 1 of 10 Spots &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
