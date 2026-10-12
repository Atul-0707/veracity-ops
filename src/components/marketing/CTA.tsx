import { useState } from 'react';
import {
  ArrowRight,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Send,
  Sparkles,
  Mail,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { brand, foundingOffer } from '@/content';

export default function CTA() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    workEmail: '',
    company: '',
    crm: 'HubSpot',
    volume: 'Founding Charter ($99/mo Annual - 50k rows + Free $450 Setup)',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-slate-50/70 text-slate-900 relative overflow-hidden border-t border-slate-200">
      {/* Background Atmosphere */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-800 mb-4 shadow-2xs">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold uppercase tracking-wider">
              10 Founding Member Licenses Available
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {foundingOffer.ctaHeadline}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {foundingOffer.ctaBody}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Enterprise Contact Desk & Guarantees */}
          <div className="lg:col-span-5 space-y-6">
            {/* ENTERPRISE CONTACT DESK CARD */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
                  Enterprise Contact &amp; Onboarding
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Engineering Desk Online
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Direct RevOps Architecture Desk
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1.5">
                    Connect directly with our engineering team for enterprise data staging, custom deduplication survivorship rules, and dedicated charter provisioning.
                  </p>
                </div>

                <div className="pt-2 space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Priority Email Desk
                      </div>
                      <a href="mailto:contact@veracity.io" className="text-xs font-bold text-slate-900 hover:text-primary-600 transition">
                        contact@veracity.io
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Response SLA
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        Under 2 Hours for Founding &amp; Enterprise Accounts
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct access subtext */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                <span>Fill out the form or reach out directly for priority provisioning.</span>
              </div>
            </div>

            {/* Bullet Proof Key Guarantees */}
            <div className="space-y-2.5 pt-2">
              {[
                'Air-gapped pre-ingestion staging with zero permanent storage',
                '7-Tab Forensic Master Excel Workbook with line-by-line audit receipts',
                'Executive SCQA ROI PDF Assessment for Boardroom presentation',
                'Lifetime free upgrade to the upcoming $349/mo RevOps Command Cockpit',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive License Claim & Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Founding License Reserved!</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-900">{formData.name}</strong>. The Veracity engineering team will connect with you within 2 hours to provision your <span className="font-semibold text-primary-700">Outbound Sentry / Founding Charter</span> workspace.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-4 mb-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary-600">
                      Contact Us / Direct Claim
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Reserve 1 of 10 Founding Member Licenses
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Locked Founder Rate · Full-Stack Engine Unlocked · 50k rows/mo
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sarah Chen"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@company.com"
                        value={formData.workEmail}
                        onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Corp"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary CRM
                      </label>
                      <select
                        value={formData.crm}
                        onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="HubSpot">HubSpot</option>
                        <option value="Salesforce">Salesforce</option>
                        <option value="Outreach/Salesloft">Outreach / Salesloft</option>
                        <option value="Smartlead/Instantly">Smartlead / Instantly</option>
                        <option value="Other">Other / Spreadsheets</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Plan / Package *
                      </label>
                      <select
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Founding Charter ($99/mo Annual - 50k rows + Free $450 Setup)">
                          Founding Charter ($99/mo Annual - $1,188)
                        </option>
                        <option value="Founding Charter ($149/mo Quarterly - 50k rows)">
                          Founding Charter ($149/mo Quarterly - $447)
                        </option>
                        <option value="The Outbound Sentry ($150/mo - 30k rows)">
                          The Outbound Sentry ($150/mo - 30k rows)
                        </option>
                        <option value="The Command Cockpit ($349/mo - 100k rows)">
                          The Command Cockpit ($349/mo - 100k rows)
                        </option>
                        <option value="The Agency Scale ($749/mo - 300k rows)">
                          The Agency Scale ($749/mo - 300k rows)
                        </option>
                        <option value="The 90-Day Quarterly Charter ($399/qtr - 90k rows)">
                          The 90-Day Quarterly Charter ($399/qtr - 90k rows)
                        </option>
                        <option value="One-Time Quick Sprint ($79 - 10k rows)">
                          One-Time Quick Sprint ($79 - 10k rows)
                        </option>
                        <option value="One-Time Campaign Overhaul ($199 - 50k rows)">
                          One-Time Campaign Overhaul ($199 - 50k rows)
                        </option>
                        <option value="One-Time Enterprise Migration ($449 - 150k rows)">
                          One-Time Enterprise Migration ($449 - 150k rows)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Custom Setup Add-On ($49 – $450)
                      </label>
                      <select
                        defaultValue="Enterprise MDM Architecture ($450 - FREE with Annual)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="None (Self-Serve - $0)">
                          None (Self-Serve Policy Sliders - $0)
                        </option>
                        <option value="Quick Recipe Tuning (+$49)">
                          Quick Recipe Tuning (+$49 one-time)
                        </option>
                        <option value="Advanced Policy Setup (+$149)">
                          Advanced Policy Setup (+$149 one-time)
                        </option>
                        <option value="Full CRM Recipe Implementation (+$299)">
                          Full CRM Recipe Implementation (+$299 one-time)
                        </option>
                        <option value="Enterprise MDM Architecture ($450 - FREE with Annual)">
                          Enterprise MDM Architecture ($450 - FREE with Annual)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notes / Specific Challenges (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tell us about your outbound lists, CRM duplicate issues, or custom routing requirements..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Claim Founding License &amp; Lock Founder Rate
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Strict 10-license cap · No long-term lock-in · 100% money-back guarantee</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
