import { useTranslation } from 'react-i18next';
import { Coffee, Instagram } from 'lucide-react';

function TikTokIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

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
              href="https://www.tiktok.com/@threeplustwo.hur?_r=1&_t=ZS-9BN6qf5ADbA"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-brand-cream/10 hover:bg-brand-cream/20 transition-colors"
              aria-label="TikTok"
            >
              <TikTokIcon size={18} />
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
