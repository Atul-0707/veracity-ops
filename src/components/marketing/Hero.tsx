import { ArrowRight, Play, CheckCircle2, Sparkles } from 'lucide-react';
import { brand } from '@/content';

export default function Hero({ onOpenDemoSandbox }: { onOpenDemoSandbox?: () => void }) {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 gradient-mesh overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-60 -left-20 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-400" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-slate-700">Call for 10 founding members</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 tracking-tight animate-fade-up animation-delay-200">
            Call for 10 <span className="gradient-text">Founding Members</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto animate-fade-up animation-delay-400">
            Most data intelligence tools penalize you for growth. They charge based on the total size of your CRM, even when you only need to clean a single 5,000-record outbound list. Veracity is changing the economics of Revenue Operations.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-600">
            <button
              type="button"
              onClick={onOpenDemoSandbox}
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              Try Live Demo (Free 500 Records)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#pricing"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              View Full Engine Plans ($150/mo)
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 animate-fade-in animation-delay-600">
            {['Air-gapped processing', 'Non-destructive records', 'Built for RevOps'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 lg:mt-20 relative animate-fade-up animation-delay-600">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-200/30 to-accent-200/30 rounded-3xl blur-2xl" />
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative bg-white rounded-2xl shadow-float border border-slate-200/60 overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 bg-white rounded-md text-xs text-slate-400 border border-slate-200">
            app.veracity.io/sentry
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col w-16 lg:w-56 bg-slate-50 border-r border-slate-200 p-3 lg:p-4 min-h-[420px]">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="hidden lg:block text-sm font-bold text-slate-800">{brand.name}</span>
          </div>
          {[
            { label: 'Dashboard', active: true },
            { label: 'Deduplicate' },
            { label: 'Merge' },
            { label: 'Clean' },
            { label: 'Enrich' },
            { label: 'Workflows' },
            { label: 'Reports' },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs lg:text-sm mb-1 ${
                item.active
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`w-4 h-4 rounded ${item.active ? 'bg-primary-500' : 'bg-slate-300'}`} />
              <span className="hidden lg:block">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main panel */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-base lg:text-lg font-bold text-slate-900">Data Health Overview</div>
              <div className="text-xs text-slate-400 mt-0.5">Last updated 2 min ago</div>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">All Sources</div>
              <div className="px-3 py-1.5 bg-primary-600 rounded-lg text-xs font-medium text-white">Run Scan</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Records', value: '248,930', trend: '+2.4%', color: 'text-slate-900' },
              { label: 'Duplicates Found', value: '1,847', trend: '-12%', color: 'text-warning-600' },
              { label: 'Health Score', value: '94.2%', trend: '+5.1%', color: 'text-success-600' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400">{stat.label}</div>
                <div className={`text-lg lg:text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-success-600 mt-0.5">{stat.trend}</div>
              </div>
            ))}
          </div>

          {/* Chart mockup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-slate-700">Data Quality Trend</div>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-xs text-slate-400">Quality Score</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-24">
              {[65, 70, 68, 75, 80, 78, 85, 82, 88, 90, 87, 94].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-primary-500 to-primary-300 opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
