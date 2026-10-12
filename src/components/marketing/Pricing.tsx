import { useState } from 'react';
import { 
  CheckCircle2, ArrowRight, Clock3, Shield, Check, Sparkles, ShieldCheck, 
  Layers, Zap, Calendar, Wrench, MessageCircle, ExternalLink 
} from 'lucide-react';
import { 
  foundingOffer, pricingTiers, quarterlyCharter, oneTimePasses, 
  customSetupAddons, brand 
} from '@/content';

type BillingMode = 'monthly' | 'quarterly' | 'onetime';

export default function Pricing() {
  const [billingMode, setBillingMode] = useState<BillingMode>('monthly');
  const [selectedAddon, setSelectedAddon] = useState<string>('Enterprise MDM Architecture');

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary-600" />
            100% Full-Stack Engine Unlocked on Every Plan
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            {foundingOffer.hookHeadline}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {foundingOffer.hookBody}
          </p>
        </div>

        {/* 3-Way Mode Toggle Switch */}
        <div className="flex items-center justify-center mb-16">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingMode('monthly')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Subscriptions
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('quarterly')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingMode === 'quarterly'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>90-Day Quarterly Charter</span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Save 11%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('onetime')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingMode === 'onetime'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              One-Time Project Passes
            </button>
          </div>
        </div>

        {/* VIEW 1: MONTHLY SUBSCRIPTIONS */}
        {billingMode === 'monthly' && (
          <div className="grid lg:grid-cols-3 gap-8 items-stretch mb-20 animate-fade-in">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                  tier.highlighted
                    ? 'bg-white border-2 border-primary-600 shadow-xl lg:-translate-y-2 ring-4 ring-primary-50/80 text-slate-900'
                    : 'bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-card text-slate-900'
                }`}
              >
                {/* Badge */}
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 bg-primary-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-xs whitespace-nowrap">
                    <Check className="w-3.5 h-3.5 text-white" /> {tier.badge}
                  </div>
                )}

                {/* Status Header */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                    {tier.volume}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                    {tier.overage}
                  </span>
                </div>

                {/* Tier Name */}
                <h3 className="text-2xl font-bold text-slate-900">
                  {tier.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-5xl font-extrabold font-display tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {tier.period}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-600">
                  {tier.description}
                </p>

                {/* Feature Bullets */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-3 text-slate-400">
                    Full Engine Capabilities:
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-primary-600" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <a
                  href="#contact"
                  className={`mt-8 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
                    tier.highlighted
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {tier.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: 90-DAY QUARTERLY CHARTER */}
        {billingMode === 'quarterly' && (
          <div className="max-w-4xl mx-auto mb-20 animate-fade-in">
            <div className="relative rounded-3xl p-8 sm:p-12 bg-white text-slate-900 border-2 border-primary-500 shadow-card overflow-hidden">
              <div className="relative grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {quarterlyCharter.badge}
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {quarterlyCharter.name}
                  </h3>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-5xl font-black font-display text-slate-900">
                      {quarterlyCharter.price}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {quarterlyCharter.period}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {quarterlyCharter.effectiveMonthly}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed pt-1">
                    {quarterlyCharter.description}
                  </p>

                  <div className="pt-2">
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                    >
                      {quarterlyCharter.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Included in 90-Day Pass:
                  </div>
                  <ul className="space-y-3">
                    {quarterlyCharter.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Zero monthly cancellation risk. Full volume pool rolls over for 90 days.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ONE-TIME PROJECT PASSES */}
        {billingMode === 'onetime' && (
          <div className="mb-20 animate-fade-in space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Single-Batch Cleaning • No Recurring Commitment
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                One-Time Project Batches with 100% Subscription Credit
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                If you decide to upgrade to an annual plan within 14 days of running your one-time pass, <strong>100% of your pass cost is credited</strong> toward your subscription.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {oneTimePasses.map((pass) => (
                <div
                  key={pass.name}
                  className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                    pass.highlighted
                      ? 'bg-white border-2 border-primary-600 text-slate-900 shadow-lg ring-4 ring-primary-50/80'
                      : 'bg-white border border-slate-200/90 text-slate-900 hover:shadow-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        pass.highlighted ? 'text-primary-700' : 'text-slate-600'
                      }`}
                    >
                      {pass.badge}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        pass.highlighted ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {pass.volume}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    {pass.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-extrabold font-display text-slate-900">
                      {pass.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      one-time
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                    {pass.description}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex-1">
                    <ul className="space-y-2.5">
                      {pass.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                          <span className="text-slate-700">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    className={`mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      pass.highlighted
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                    }`}
                  >
                    {pass.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM SETUP & ONBOARDING ADD-ONS ($49 to $450) */}
        <div className="mb-20 p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Wrench className="w-3.5 h-3.5 text-primary-600" />
              Concierge Customization &amp; Implementation
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Custom Setup &amp; Policy Add-Ons ($49 – $450)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Don&apos;t want to build your own recipes? Our engineering team will configure your company-specific CRM field mappings, custom regex standards, bespoke survivorship rules, and domain blacklists.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {customSetupAddons.map((addon) => (
              <div
                key={addon.tier}
                onClick={() => setSelectedAddon(addon.tier)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedAddon === addon.tier
                    ? 'bg-white border-primary-500 shadow-md ring-2 ring-primary-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900">{addon.tier}</span>
                    <span className="text-base font-extrabold text-primary-600 font-display">
                      {addon.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    {addon.description}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {addon.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-[10px] text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#contact"
                  className={`mt-2 py-2 px-3 rounded-lg text-center text-xs font-bold transition-all ${
                    selectedAddon === addon.tier
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Select Add-On
                </a>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4 text-primary-600" />
              <strong>Annual Founding Members Notice:</strong> The $450 Enterprise MDM Architecture Setup is <strong>100% Free</strong> with your charter.
            </span>
            <a href="#contact" className="text-primary-600 font-bold hover:underline">
              Speak with RevOps Leadership &rarr;
            </a>
          </div>
        </div>

        {/* THE FOUNDER'S CHARTER: 10 LICENSES */}
        <div className="relative rounded-3xl bg-slate-50 text-slate-900 p-8 sm:p-12 lg:p-14 border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Offer Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-primary-600" />
                {foundingOffer.founderHeadline}
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {foundingOffer.founderPricingAnnual}
              </h3>
              <div className="text-sm font-semibold text-primary-700">
                Or {foundingOffer.founderPricingQuarterly}
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {foundingOffer.founderBody}
              </p>
              <div className="pt-2 flex items-center gap-4 flex-wrap">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  Claim 1 of 10 Founding Licenses
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-bold rounded-xl transition shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-primary-600" />
                  Contact Leadership
                </a>
              </div>
            </div>

            {/* Right Column: Lifetime Unlocked Add-Ons Card */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-primary-600" />
                  VIP Charter Guarantees:
                </div>
                <ul className="space-y-3">
                  {foundingOffer.lifetimeAddOns.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Strictly capped at 10 founding organizations · Direct WhatsApp VIP channel included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
