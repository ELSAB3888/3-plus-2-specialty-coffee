import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Coffee, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useMenuData, useExtras } from '@/hooks/useData';
import { localized, cn } from '@/lib/utils';
import { CategoryNav } from './CategoryNav';
import { MenuItem } from './MenuItem';
import { ExtrasSection } from './ExtrasSection';
import { LoadingScreen } from '@/components/ui/Spinner';

export function MenuPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { menuData, loading, error, refetch } = useMenuData();
  const { extras, loading: extrasLoading } = useExtras(true);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Filter categories and products
  const filteredMenu = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuData
      .filter((cat) => (activeCategoryId === null || activeCategoryId === 'extras' ? true : cat.id === activeCategoryId))
      .map((cat) => {
        let prods = cat.products;

        if (query) {
          prods = prods.filter((p) => {
            const nameEn = p.name_en?.toLowerCase() || '';
            const nameAr = p.name_ar?.toLowerCase() || '';
            const descEn = p.description_en?.toLowerCase() || '';
            const descAr = p.description_ar?.toLowerCase() || '';
            return (
              nameEn.includes(query) ||
              nameAr.includes(query) ||
              descEn.includes(query) ||
              descAr.includes(query)
            );
          });
        }

        return { ...cat, products: prods };
      })
      .filter((cat) => cat.products.length > 0 || !query);
  }, [menuData, activeCategoryId, searchQuery]);

  const handleToggleExpand = (productId: string) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  if (loading || extrasLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="menu-container py-20 text-center animate-fade-in">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => void refetch()} className="btn-primary">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const hasAnyProducts = filteredMenu.some((c) => c.products.length > 0);

  return (
    <div className="min-h-screen bg-brand-cream-50 pb-24 animate-fade-in">
      {/* Brand Menu Banner */}
      <section className="bg-brand-olive-900 text-brand-cream-100 pt-10 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
        <div className="menu-container text-center relative z-10">
          {/* Sibling badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold-light text-[11px] font-medium uppercase tracking-widest mb-3">
            <Sparkles size={12} className="fill-current text-brand-gold" />
            <span>{t('home.storyBadge')}</span>
            <span className="opacity-50">·</span>
            <span>{t('home.tagline')}</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
            {t('common.appName')}
          </h1>

          <p className="text-xs md:text-sm text-brand-cream-300 max-w-md mx-auto">
            {t('menu.subtitle')}
          </p>

          {/* Real-time Search Box */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search
              size={18}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-brand-olive-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.searchPlaceholder')}
              className={cn(
                'w-full bg-white/10 text-white placeholder:text-brand-cream-400/70',
                'border border-white/20 rounded-full py-2.5 ps-10 pe-10 text-xs md:text-sm',
                'focus:outline-hidden focus:bg-white/20 focus:border-brand-gold/70 transition-all'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-brand-cream-300 hover:text-white"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={menuData}
        activeCategoryId={activeCategoryId}
        onSelectCategory={(id) => {
          setActiveCategoryId(id);
          if (id === 'extras') {
            document.getElementById('extras-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        extrasCount={extras.length}
      />

      {/* Main Menu List */}
      <div className="menu-container mt-6">
        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between text-xs text-brand-olive-500 bg-brand-cream-200/50 px-4 py-2.5 rounded-brand">
            <span>
              {language === 'ar'
                ? `نتائج البحث عن "${searchQuery}"`
                : `Search results for "${searchQuery}"`}
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-brand-olive hover:underline font-medium"
            >
              {language === 'ar' ? 'مسح البحث' : 'Clear search'}
            </button>
          </div>
        )}

        {/* Categories and Products */}
        {hasAnyProducts ? (
          <div className="space-y-12">
            {filteredMenu.map((category) => {
              if (category.products.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={`cat-${category.id}`}
                  className="animate-fade-in"
                >
                  {/* Category Header with Editorial styling */}
                  <div className="mb-5">
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-xl md:text-2xl font-bold text-brand-espresso">
                        {localized(category, 'name', language)}
                      </h2>
                    </div>

                    {category.description_en && (
                      <p className="text-xs text-brand-olive-500 mt-1 max-w-xl">
                        {localized(category, 'description', language)}
                      </p>
                    )}

                    {/* Subtle decorative wavy divider */}
                    <div className="mt-3 flex items-center gap-2">
                      <svg width="40" height="6" viewBox="0 0 40 6" fill="none" className="text-brand-gold">
                        <path
                          d="M1 3C4 1 8 1 11 3C14 5 18 5 21 3C24 1 28 1 31 3C34 5 38 5 39 3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="h-px bg-brand-cream-300 flex-1" />
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="space-y-1 divide-y divide-brand-cream-200/80">
                    {category.products.map((product) => (
                      <MenuItem
                        key={product.id}
                        product={product}
                        isExpanded={expandedProductId === product.id}
                        onToggleExpand={() => handleToggleExpand(product.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-brand border border-brand-cream-300">
            <Coffee size={40} className="mx-auto text-brand-olive-300 mb-3" />
            <h3 className="font-serif text-lg font-semibold text-brand-espresso mb-1">
              {searchQuery ? t('menu.noSearchResults') : t('menu.noProducts')}
            </h3>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary mt-4 text-xs"
              >
                {language === 'ar' ? 'عرض كل الأصناف' : 'Show all items'}
              </button>
            )}
          </div>
        )}

        {/* Independent Extras Section at the end of the menu */}
        <ExtrasSection extras={extras} />
      </div>
    </div>
  );
}
