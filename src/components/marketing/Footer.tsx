import { brand } from '@/content';
import { Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-3 space-y-4">
            <a href="#" className="inline-flex items-center" aria-label={brand.name}>
              <div className="w-40 h-11 overflow-hidden rounded-lg bg-white shadow-sm">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-full object-contain object-left px-2"
                />
              </div>
            </a>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              {brand.description}
            </p>

            {/* Enterprise Contact & Support */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
              >
                <Mail className="w-3.5 h-3.5 text-primary-400" />
                <span>Contact Enterprise Team</span>
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Air-Gapped Infrastructure</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 pt-1">
              Air-Gapped Revenue Operations · Ephemeral DuckDB Void · Lie Factor = 1.000
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Dedup &amp; Merge
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Clean &amp; Standardize
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Magical Import
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Enrich &amp; Segment
                </a>
              </li>
            </ul>
          </div>

          {/* Pricing & Offer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Economics</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  The Outbound Sentry ($150/mo)
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Command Cockpit ($349/mo)
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Agency Scale ($749/mo)
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-primary-400 text-primary-300 font-semibold transition-colors">
                  10 Founding Member Charter
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  Executive Leadership
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Security Architecture
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {brand.name} Inc. All rights reserved. Built for RevOps leaders.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Air-Gapped Engine Operational
            </span>
            <span>Zero Permanent PII Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
