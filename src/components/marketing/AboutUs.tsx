import { aboutUsContent } from '@/content';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutUs() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold tracking-wide uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
            {aboutUsContent.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            {aboutUsContent.title}
          </h2>
          <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            <p>{aboutUsContent.narrative1}</p>
            <p>{aboutUsContent.narrative2}</p>
            <p className="font-medium text-slate-800">{aboutUsContent.narrative3}</p>
          </div>
        </div>

        {/* 4 Core Principles Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aboutUsContent.principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-primary-300 hover:shadow-card transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{principle.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {principle.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Metric Strip */}
        <div className="mt-14 p-8 rounded-3xl bg-white border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-display">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Air-Gapped Execution</div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-primary-600 font-display">O(1)</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Constant-Time Rollback</div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-2xl lg:text-3xl font-extrabold text-emerald-600 font-display">$0</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Historical CRM Database Tax</div>
            </div>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all shrink-0"
          >
            Speak With Our Engineering Team
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
