import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, Flame, Droplets, Star, Coffee } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useFeaturedProducts } from '@/hooks/useData';
import { localized, formatPrice, cn } from '@/lib/utils';

const BASE = import.meta.env.BASE_URL;

/** Prefix a local asset path with Vite's base so it resolves on GitHub Pages */
function assetUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith(BASE)) return src;
  return BASE + src.replace(/^\//, '');
}

// ─── Animated grain texture (SVG base64 inline) ───────────────────────────────
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;


// ─── Animated scroll fade-in hook ─────────────────────────────────────────────
function useFadeInOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-6');
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Language Switcher ─────────────────────────────────────────────────────────
function LangSwitcher({ floating = false }: { floating?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={cn(
        'text-xs font-medium tracking-wider uppercase transition-all duration-200 px-3 py-1.5 rounded-full border',
        floating
          ? 'bg-white/10 border-white/30 text-brand-cream hover:bg-white/20 backdrop-blur-sm'
          : 'bg-brand-cream-100 border-brand-cream-300 text-brand-olive-700 hover:bg-brand-cream-200'
      )}
    >
      {t('common.switchLang')}
    </button>
  );
}

// ─── HomePage ──────────────────────────────────────────────────────────────────
export function HomePage() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const { products: featured, loading } = useFeaturedProducts();

  const qualityRef = useFadeInOnScroll<HTMLDivElement>();
  const featuredRef = useFadeInOnScroll<HTMLDivElement>();
  const storyRef = useFadeInOnScroll<HTMLDivElement>();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════
          HERO — full viewport
      ════════════════════════════════════════════════════════════════*/}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-brand-espresso via-[#2C3A1E] to-brand-olive-800">
        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat' }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

        {/* Top bar: lang switcher */}
        <div className="relative z-20 flex justify-end px-6 pt-6 sm:px-10">
          <LangSwitcher floating />
        </div>

        {/* Central hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center">
          {/* Specialty badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/20 text-brand-gold-light text-[11px] font-semibold tracking-widest uppercase mb-8 animate-fade-in-up">
            <Star size={11} className="fill-current" />
            Specialty Coffee · Egypt
          </div>

          {/* Logo / Brand name */}
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-brand-cream leading-[1.05] tracking-tight animate-fade-in-up mb-4">
            {language === 'ar' ? (
              <>٣<span className="text-brand-gold">+</span>٢</>
            ) : (
              <>3<span className="text-brand-gold">+</span>2</>
            )}
          </h1>
          <p className="font-serif text-xl sm:text-2xl text-brand-gold-light/90 font-medium mb-2 animate-fade-in-up">
            {language === 'ar' ? 'قهوة مختصة' : 'Specialty Coffee'}
          </p>


          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl text-brand-cream-300 max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up font-light">
            {language === 'ar'
              ? '٣ أخوات، أخوان — كوب واحد متقن'
              : '3 Sisters, 2 Brothers — One Perfect Cup'}
          </p>

          {/* CTA */}
          <Link
            to="/menu"
            className={cn(
              'inline-flex items-center gap-3 px-9 py-4 rounded-full',
              'bg-brand-gold text-brand-espresso font-semibold text-sm sm:text-base',
              'hover:bg-brand-gold-light transition-all duration-300',
              'hover:shadow-xl hover:shadow-brand-gold/30 active:scale-[0.97] animate-fade-in-up'
            )}
          >
            {t('common.viewMenu')}
            <ArrowRight
              size={18}
              className={cn('transition-transform group-hover:translate-x-1', isRTL && 'rotate-180')}
            />
          </Link>
        </div>

        {/* Decorative wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path
              d="M0 80V50C200 20 400 10 600 30C800 50 1000 70 1200 50C1320 38 1380 30 1440 20V80H0Z"
              fill="#F5F0E8"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CRAFT PHILOSOPHY
      ════════════════════════════════════════════════════════════════*/}
      <section className="py-20 md:py-28 bg-brand-cream">
        <div
          ref={qualityRef}
          className="max-w-5xl mx-auto px-6 opacity-0 translate-y-6 transition-all duration-700"
        >
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-espresso mb-3">
              {t('home.qualityTitle')}
            </h2>
            <div className="w-10 h-0.5 bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, titleKey: 'quality1Title', descKey: 'quality1Desc' },
              { icon: Flame, titleKey: 'quality2Title', descKey: 'quality2Desc' },
              { icon: Droplets, titleKey: 'quality3Title', descKey: 'quality3Desc' },
            ].map((item) => (
              <div key={item.titleKey} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-olive-50 flex items-center justify-center group-hover:bg-brand-olive-100 group-hover:scale-110 transition-all duration-300 shadow-brand-sm">
                  <item.icon size={28} className="text-brand-olive" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-brand-espresso mb-2">
                  {t(`home.${item.titleKey}`)}
                </h3>
                <p className="text-sm text-brand-olive-500 leading-relaxed max-w-xs mx-auto">
                  {t(`home.${item.descKey}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PRODUCTS (if any)
      ════════════════════════════════════════════════════════════════*/}
      {!loading && featured.length > 0 && (
        <section className="py-20 bg-white">
          <div
            ref={featuredRef}
            className="max-w-5xl mx-auto px-6 opacity-0 translate-y-6 transition-all duration-700"
          >
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-espresso mb-2">
                {t('home.featuredTitle')}
              </h2>
              <p className="text-sm text-brand-olive-400">{t('home.featuredSubtitle')}</p>
              <div className="w-10 h-0.5 bg-brand-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product, index) => {
                const minPrice =
                  product.sizes.length > 0
                    ? Math.min(...product.sizes.map((s) => s.price))
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="rounded-brand overflow-hidden shadow-brand-md border border-brand-cream-300 bg-brand-cream-50 hover:shadow-brand-lg hover:-translate-y-1 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {product.image ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={assetUrl(product.image)!}
                          alt={localized(product, 'name', language)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-brand-olive-50 to-brand-cream-200 flex items-center justify-center">
                        <Coffee size={40} className="text-brand-olive-200" />
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="font-serif font-semibold text-brand-espresso mb-1">
                        {localized(product, 'name', language)}
                      </h3>
                      {(product.description_en || product.description_ar) && (
                        <p className="text-xs text-brand-olive-400 line-clamp-2 mb-3">
                          {localized(product, 'description', language)}
                        </p>
                      )}
                      {minPrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-brand-olive-400">
                            {t('menu.startingFrom')}
                          </span>
                          <span className="font-semibold text-brand-olive">
                            {formatPrice(minPrice, language)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-brand-olive text-brand-olive font-medium text-sm hover:bg-brand-olive hover:text-brand-cream transition-all duration-200"
              >
                {t('common.viewMenu')}
                <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STORY SECTION
      ════════════════════════════════════════════════════════════════*/}
      <section className="py-20 md:py-28 bg-brand-cream">
        <div
          ref={storyRef}
          className="max-w-3xl mx-auto px-6 text-center opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-espresso mb-6">
            {t('home.storyTitle')}
          </h2>
          <div className="w-10 h-0.5 bg-brand-gold mx-auto mb-8" />
          <p className="text-base md:text-lg text-brand-olive-600 leading-relaxed">
            {t('home.storyText')}
          </p>

          {/* CTA at bottom */}
          <div className="mt-10">
            <Link
              to="/menu"
              className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-brand-espresso text-brand-cream font-semibold text-sm hover:bg-brand-olive-900 transition-all duration-300 hover:shadow-lg hover:shadow-brand-espresso/20"
            >
              {t('common.viewMenu')}
              <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER STRIP
      ════════════════════════════════════════════════════════════════*/}
      <footer className="py-6 bg-brand-espresso text-center">
        <p className="text-xs text-brand-cream-300/60 font-light tracking-wide">
          {language === 'ar'
            ? '© ٣+٢ قهوة مختصة — مصر'
            : '© 3+2 Specialty Coffee — Egypt'}
        </p>
      </footer>
    </div>
  );
}
