import { ArrowRight, CheckCircle2, Shield, Database, ArrowRightLeft, Cpu } from 'lucide-react';
import { brand, ecosystemTools } from '@/content';

export default function Hero({ onOpenDemoSandbox }: { onOpenDemoSandbox?: () => void }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 gradient-mesh overflow-hidden border-b border-slate-200/80">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-60 -left-20 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-400" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs mb-6">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Air-Gapped Pre-Ingestion Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pre-Ingestion Data Hygiene for <br className="hidden sm:inline" />
            <span className="gradient-text">Modern Outbound &amp; CRM Stacks</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Deduplicate, normalize, and sanitize chaotic lead lists in 30 seconds — before burning expensive Clay credits or poisoning your HubSpot CRM with duplicate company records.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenDemoSandbox}
              className="group inline-flex items-center gap-2.5 px-7 py-4 text-base font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Launch Client-Side Portal (Unlimited Rows • 0 Bytes Uploaded)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 px-6 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
            >
              View Agency &amp; Engine Plans
            </a>
          </div>

          {/* Key Trust Guarantees */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            {[
              '100% Client-Side Browser RAM (0 Bytes Uploaded — Works Offline)',
              'Unlimited File Size & 100% Full CSV / 7-Tab Excel Export',
              'Universal E.164 Phones, Brand Case Protection & O(1) Dedup',
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Ecosystem Compatibility Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200/60">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5">
              Engineered to protect workflows across your entire stack:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {ecosystemTools.map((tool) => (
                <div
                  key={tool.name}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all hover:scale-105 ${tool.color}`}
                >
                  <span className="font-bold">{tool.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">({tool.benefit})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline Preview Visualizer */}
        <div className="mt-14 lg:mt-16 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-200/25 to-sky-200/25 rounded-3xl blur-2xl pointer-events-none" />
          <PipelinePreview />
        </div>
      </div>
    </section>
  );
}

function PipelinePreview() {
  return (
    <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-300">
            veracity-engine :: pre-ingestion-pipeline.active
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          RAM Memory Isolated (0ms Storage Void)
        </div>
      </div>

      {/* Interactive 3-Stage Pipeline Graphic */}
      <div className="p-6 lg:p-8 bg-slate-50/50">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Stage 1: Raw Unvetted Input */}
          <div className="p-5 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                1. Raw Batch Ingest
              </span>
              <Database className="w-4 h-4 text-rose-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Chaotic Apollo / Scraped Export</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unfiltered contacts with casing errors, international format conflicts, and duplicate corporate domains.
            </p>
            <div className="space-y-1.5 pt-2 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
              <div className="text-rose-600 line-through">"JONATHAN DOE" &lt;j.doe@acme.com&gt;</div>
              <div className="text-rose-600 line-through">"07911 123456" (UK Local format)</div>
              <div className="text-rose-600 line-through">"Acme Corp" &amp; "Acme Inc" (Unlinked)</div>
            </div>
          </div>

          {/* Stage 2: Veracity Engine */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-primary-900 to-slate-900 text-white border border-primary-700 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-primary-500/20 rounded-full blur-xl" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200 bg-primary-800/80 px-2.5 py-0.5 rounded-full border border-primary-600">
                2. Automated Scrub
              </span>
              <Cpu className="w-4 h-4 text-primary-400 animate-spin-slow" />
            </div>
            <h4 className="text-sm font-bold text-white">Veracity Deterministic Engine</h4>
            <ul className="text-xs text-slate-300 space-y-2 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fuzzy match &amp; golden record merge</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>E.164 phone formatting (+44 / +1 / +91)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Name title casing &amp; catch-all flag</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>RFC 6902 reverse patch ledger</span>
              </li>
            </ul>
          </div>

          {/* Stage 3: Pristine Output */}
          <div className="p-5 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                3. Pristine Output
              </span>
              <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">CRM &amp; Outreach Ready</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standardized, deduplicated records ready for zero-bounce sequencing in Smartlead and clean HubSpot sync.
            </p>
            <div className="space-y-1.5 pt-2 font-mono text-[11px] bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 text-slate-800">
              <div className="text-emerald-700 font-semibold">Jonathan Doe &lt;j.doe@acme.com&gt;</div>
              <div className="text-emerald-700 font-semibold">+44 7911 123456 (E.164 valid)</div>
              <div className="text-emerald-700 font-semibold">Acme Corporation (Golden Entity)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
