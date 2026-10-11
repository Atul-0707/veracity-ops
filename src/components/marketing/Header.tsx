import { useEffect, useRef, useState } from 'react';
import { Menu, X, ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { brand, navItems, type NavItem } from '@/content';

function NavDropdown({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <a
        href={item.href}
        className="flex items-center gap-1 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
      >
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </a>
      {open && item.children && (
        <div className="absolute left-0 top-full pt-2 w-84 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-float border border-slate-100 p-2 overflow-hidden">
            {item.children.map((child) => {
              const Icon = child.icon;
              return (
                <a
                  key={child.label}
                  href={child.href}
                  onClick={() => {
                    setOpen(false);
                    onNavigate();
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Icon className="w-4.5 h-4.5 text-primary-600" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {child.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{child.description}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header({ onOpenDemoSandbox }: { onOpenDemoSandbox?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group" aria-label={brand.name}>
              <div className="relative w-36 sm:w-40 h-10 sm:h-11 overflow-hidden rounded-lg bg-white shadow-xs transition-transform group-hover:scale-[1.02]">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="absolute inset-0 h-full w-full object-contain object-left"
                />
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) =>
                item.children ? (
                  <NavDropdown key={item.label} item={item} onNavigate={() => {}} />
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenDemoSandbox}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                Live Demo (500 Records)
              </button>
              <a
                href="#pricing"
                className="group inline-flex items-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Claim Your License
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="py-2 border-b border-slate-100">
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    {item.children.map((child) => {
                      const Icon = child.icon;
                      return (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-primary-600 shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{child.label}</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                )
              )}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenDemoSandbox?.();
                  }}
                  className="block w-full py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-xl text-center shadow-xs cursor-pointer"
                >
                  ⚡ Live Demo (500 Records)
                </button>
                <a
                  href="#pricing"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl text-center shadow-md"
                >
                  Claim Your License
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
