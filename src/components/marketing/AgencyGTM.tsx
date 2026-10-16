import { agencyGtmContent } from '@/content';
import { Layers, ShieldCheck, ArrowRight, Database } from 'lucide-react';

export default function AgencyGTM({ onOpenDemoSandbox }: { onOpenDemoSandbox?: () => void }) {
  return (
    <section id="agency" className="py-20 lg:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-bold tracking-wider uppercase mb-4">
            <Layers className="w-3.5 h-3.5 text-primary-600" />
            {agencyGtmContent.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {agencyGtmContent.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {agencyGtmContent.subtitle}
          </p>
        </div>

        {/* 4 Architectural Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agencyGtmContent.pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl font-extrabold text-primary-700 font-mono mb-1">
                  {pillar.metric}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
                  {pillar.metricLabel}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-primary-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic Zero-Error Rule</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Bar for Agency Partnerships */}
        <div className="mt-12 p-8 rounded-2xl bg-slate-900 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-bold uppercase tracking-wider text-primary-400">
              <Layers className="w-4 h-4 text-sky-400" />
              Agency &amp; Retainer White-Label Model
            </div>
            <h4 className="text-xl font-bold text-white">
              Want to plug Veracity directly into your client onboarding retainers?
            </h4>
            <p className="text-xs text-slate-300 max-w-2xl">
              We offer volume agency tiering with private webhook endpoints, bulk batch credits, and co-branded audit ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenDemoSandbox}
              className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              Test Live Sandbox
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#contact"
              className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition shadow-xs"
            >
              Talk with Engineering
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
