import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Languages, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const { t } = useTranslation();
  const { toggleLanguage, isRTL } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('home.title').split(' ')[0] ?? 'Home' },
    { to: '/menu', label: t('menu.title') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-brand-cream-300/60">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Official Brand Logo */}
          <Link
            to="/"
            className="flex items-center group py-1"
            aria-label="3+2 Specialty Coffee"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/logo.png`}
              alt="3+2 Specialty Coffee"
              className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-4 py-2 rounded-brand text-sm font-medium transition-all duration-200',
                  isActive(link.to)
                    ? 'bg-brand-olive text-brand-cream shadow-brand-sm'
                    : 'text-brand-olive-600 hover:bg-brand-olive-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-brand text-sm font-medium',
                'text-brand-olive-600 hover:bg-brand-olive-50 transition-all duration-200'
              )}
              aria-label="Toggle language"
            >
              <Languages size={16} />
              <span className="hidden sm:inline">{t('common.switchLang')}</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-brand text-brand-olive-600 hover:bg-brand-olive-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className={cn(
            'md:hidden pb-4 animate-fade-in',
            isRTL ? 'text-right' : 'text-left'
          )}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-brand text-sm font-medium transition-all duration-200',
                    isActive(link.to)
                      ? 'bg-brand-olive text-brand-cream'
                      : 'text-brand-olive-600 hover:bg-brand-olive-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
