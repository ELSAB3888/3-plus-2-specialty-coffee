import { useTranslation } from 'react-i18next';
import { Coffee, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-espresso text-brand-cream-200 mt-auto">
      <div className="page-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-olive flex items-center justify-center">
              <Coffee size={20} className="text-brand-cream" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-brand-cream">
                {t('common.appName')}
              </h3>
              <p className="text-xs text-brand-cream-400 mt-0.5">
                {t('common.tagline')}
              </p>
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/threeplustwo.hur?xtok=MWZnbWl2bTg2YnphZw=="
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-brand-cream/10 hover:bg-brand-cream/20 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="p-2 rounded-full bg-brand-cream/10 hover:bg-brand-cream/20 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 mt-8 pt-6">
          <p className="text-center text-xs text-brand-cream-400">
            © {year} {t('common.appName')}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
