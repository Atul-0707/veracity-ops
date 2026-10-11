import { testimonials } from '@/content';
import { Star, Quote } from 'lucide-react';

export default function StatsTestimonials() {
  return (
    <>
      {/* Testimonials */}
      <section id="cases" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-warning-500 text-warning-500" />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              Designed for <span className="gradient-text">RevOps Confidence</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The Veracity approach is built around safe movement, explainable decisions, and useful deliverables.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative p-6 lg:p-8 bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-float transition-shadow"
              >
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                <p className="text-sm lg:text-base text-slate-700 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{t.author}</div>
                    <div className="text-xs text-slate-500">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
