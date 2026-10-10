import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, Flame, Droplets, Star } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useFeaturedProducts } from '@/hooks/useData';
import { localized, formatPrice, cn } from '@/lib/utils';

export function HomePage() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const { products: featured, loading } = useFeaturedProducts();

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-espresso via-brand-olive-800 to-brand-olive-700">
        <div className="absolute inset-0 bg-grain opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative page-container py-24 md:py-36 lg:py-44">
          <div className="max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/20 text-brand-gold-light text-xs font-medium tracking-wider uppercase mb-8 animate-fade-in-up">
              <Star size={12} className="fill-current" />
              Specialty Coffee
            </div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-brand-cream mb-6 leading-[1.1] tracking-tight animate-fade-in-up">
              {t('home.subtitle')}
            </h1>

            <p className="text-base md:text-lg text-brand-cream-300 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
              {t('home.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-brand bg-brand-gold text-brand-espresso font-semibold text-sm hover:bg-brand-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-brand-gold/20 active:scale-[0.98]"
              >
                {t('home.ctaMenu')}
                <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
            <path
              d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z"
              fill="#F5F0E8"
            />
          </svg>
        </div>
      </section>

      {/* Quality Promises */}
      <section className="py-20 md:py-28">
        <div className="page-container">
          <div className="text-center mb-16">
            <h2 className="section-title mb-3">{t('home.qualityTitle')}</h2>
            <div className="w-12 h-0.5 bg-brand-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Leaf, titleKey: 'quality1Title', descKey: 'quality1Desc' },
              { icon: Flame, titleKey: 'quality2Title', descKey: 'quality2Desc' },
              { icon: Droplets, titleKey: 'quality3Title', descKey: 'quality3Desc' },
            ].map((item, index) => (
              <div
                key={item.titleKey}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-olive-50 flex items-center justify-center group-hover:bg-brand-olive-100 group-hover:scale-110 transition-all duration-300">
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

      {/* Featured Drinks */}
      {!loading && featured.length > 0 && (
        <section className="py-20 bg-white">
          <div className="page-container">
            <div className="text-center mb-12">
              <h2 className="section-title mb-2">{t('home.featuredTitle')}</h2>
              <p className="text-sm text-brand-olive-400">{t('home.featuredSubtitle')}</p>
              <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featured.map((product, index) => {
                const minPrice = product.product_sizes.length > 0
                  ? Math.min(...product.product_sizes.map((s) => s.price))
                  : 0;

                return (
                  <div
                    key={product.id}
                    className="card-hover overflow-hidden group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {product.image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={localized(product, 'name', language)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-brand-olive-50 to-brand-cream-200 flex items-center justify-center">
                        <Droplets size={40} className="text-brand-olive-200" />
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="font-serif font-semibold text-brand-espresso mb-1">
                        {localized(product, 'name', language)}
                      </h3>
                      {product.description_en && (
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
              <Link to="/menu" className="btn-secondary">
                {t('home.ctaMenu')}
                <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="section-title mb-6">{t('home.storyTitle')}</h2>
            <div className="w-12 h-0.5 bg-brand-gold mx-auto mb-8" />
            <p className="text-base md:text-lg text-brand-olive-600 leading-relaxed">
              {t('home.storyText')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
