import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NAV_LINKS } from '../data/clinicData';
import { LotusMark } from './LotusMark';

interface HeaderProps {
  activeSection: string;
  scrollPercent: number;
  onOpenBooking: (serviceId?: string) => void;
}

export function Header({ activeSection, scrollPercent, onOpenBooking }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0D060B]/92 border-b border-[#F4A5C0]/12">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 h-[68px] flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#asosiy"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('asosiy');
          }}
          className="flex items-center gap-2.5 text-[#F9EEF3] hover:text-[#F4A5C0] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94] rounded-sm"
        >
          <LotusMark className="w-7 h-5 text-[#E5C185] shrink-0" />
          <span className="font-display text-[22px] font-semibold tracking-tight leading-none">
            Dr. Dilnoza
          </span>
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Asosiy navigatsiya"
          className="hidden md:flex items-center gap-7 text-[14px] font-medium"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`relative py-1.5 transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E86B94] rounded-sm ${
                  isActive ? 'text-[#F9EEF3]' : 'text-[#B89EA9] hover:text-[#F9EEF3]'
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#E86B94] transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary CTA + mobile drawer button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onOpenBooking()}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-[13px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] active:scale-[0.98] rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A5C0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D060B]"
          >
            Qabulga yozilish
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md border border-[#F4A5C0]/20 text-[#F9EEF3] hover:bg-[#21101D] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Scroll progress hairline */}
      <div className="h-[2px] w-full bg-[#F4A5C0]/8 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-[#E86B94] via-[#F4A5C0] to-[#E5C185] origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${Math.max(0.01, Math.min(1, scrollPercent))})` }}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#140811] border-b border-[#F4A5C0]/15 px-5 py-5 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.id);
                }}
                className={`block py-2.5 text-[15px] font-medium border-b border-[#F4A5C0]/8 transition-colors ${
                  isActive ? 'text-[#F4A5C0]' : 'text-[#F9EEF3]/85 hover:text-[#F4A5C0]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 px-4 text-[14px] font-semibold text-[#14070F] bg-[#E86B94] hover:bg-[#F182A7] rounded-md transition-colors cursor-pointer"
            >
              Qabulga yozilish
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
