import { Workflow, BarChart3, Zap, ShieldCheck, Clock, Network, Filter, FileSpreadsheet, Globe, Lock, Users, Bell, Sparkles } from 'lucide-react';
import { infoZones, type InfoZone } from '@/content';

function ZoneVisual({ type }: { type: InfoZone['visual'] }) {
  switch (type) {
    case 'workflow':
      return <WorkflowVisual />;
    case 'analytics':
      return <AnalyticsVisual />;
    case 'automation':
      return <AutomationVisual />;
    case 'security':
      return <SecurityVisual />;
    default:
      return null;
  }
}

function WorkflowVisual() {
  const steps = [
    { label: 'Scan', icon: Filter, color: 'bg-primary-500' },
    { label: 'Deduplicate', icon: Users, color: 'bg-primary-600' },
    { label: 'Merge', icon: Workflow, color: 'bg-accent-500' },
    { label: 'Enrich', icon: Sparkles, color: 'bg-accent-600' },
  ];
  return (
    <div className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Workflow Pipeline</div>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-semibold text-slate-900">{step.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">Step {i + 1}</div>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-11 mt-14 w-px h-4 bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
        <Clock className="w-4 h-4 text-primary-600" />
        <span className="text-xs font-medium text-slate-700">Scheduled: Every Monday at 9:00 AM</span>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-sm font-bold text-slate-900">Data Health Score</div>
          <div className="text-xs text-slate-400">Updated in real-time</div>
        </div>
        <div className="text-3xl font-bold gradient-text">94.2</div>
      </div>
      {/* Score bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>0</span><span>50</span><span>100</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: '94%' }} />
        </div>
      </div>
      {/* Breakdown */}
      <div className="space-y-2.5">
        {[
          { label: 'Completeness', value: 96, color: 'bg-success-500' },
          { label: 'Accuracy', value: 91, color: 'bg-primary-500' },
          { label: 'Uniqueness', value: 88, color: 'bg-accent-500' },
          { label: 'Consistency', value: 94, color: 'bg-primary-600' },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-24 flex-shrink-0">{m.label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.value}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-8 text-right">{m.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationVisual() {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Automation Rules</div>
      {[
        { condition: 'New record created', action: 'Auto-enrich company data', active: true },
        { condition: 'Duplicate detected', action: 'Auto-merge with 95%+ confidence', active: true },
        { condition: 'Email bounces', action: 'Flag record + notify owner', active: true },
        { condition: 'Missing phone number', action: 'Search and append', active: false },
      ].map((rule, i) => (
        <div key={i} className="flex items-center gap-3 p-3 mb-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-success-500 animate-pulse' : 'bg-slate-300'}`} />
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-700">
              <span className="text-slate-400">IF</span> {rule.condition}
            </div>
            <div className="text-xs font-medium text-slate-700 mt-0.5">
              <span className="text-slate-400">THEN</span> {rule.action}
            </div>
          </div>
          <div className={`w-9 h-5 rounded-full flex items-center transition-colors ${rule.active ? 'bg-primary-500' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityVisual() {
  const badges = [
    { label: 'SOC 2 Type II', icon: ShieldCheck },
    { label: 'GDPR Ready', icon: Globe },
    { label: '256-bit Encryption', icon: Lock },
    { label: 'SSO / SAML', icon: Network },
  ];
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">Security & Compliance</div>
          <div className="text-xs text-slate-400">Enterprise-grade protection</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Icon className="w-4.5 h-4.5 text-primary-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700">{b.label}</span>
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-semibold text-slate-700">Data Processing Policy</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your data is encrypted in transit and at rest. We never store your records — all processing is ephemeral and fully audited.
        </p>
      </div>
    </div>
  );
}

export default function InfoZones() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Built for <span className="gradient-text">Modern Revenue Teams</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Veracity gives RevOps teams a safer path from raw inputs to trusted decisions, without taxing the total size of the CRM.
          </p>
        </div>

        <div className="space-y-24 lg:space-y-32">
          {infoZones.map((zone) => (
            <div
              key={zone.id}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                zone.reverse ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              {/* Text */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold mb-4">
                  {zone.badge}
                </div>
                <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 mb-4">
                  {zone.title}
                </h3>
                <p className="text-base lg:text-lg text-slate-600 leading-relaxed mb-6">
                  {zone.description}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {zone.bullets.map((bullet) => {
                    const Icon = bullet.icon;
                    return (
                      <div key={bullet.text} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Icon className="w-4.5 h-4.5 text-primary-600" />
                        </div>
                        <span className="text-sm text-slate-700 pt-1.5">{bullet.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-100/30 to-accent-100/30 rounded-3xl blur-2xl" />
                <div className="relative animate-float">
                  <ZoneVisual type={zone.visual} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
