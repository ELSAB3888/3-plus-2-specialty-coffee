import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Coffee, Puzzle, Eye, Plus, ArrowUpRight } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { LoadingScreen } from '@/components/ui/Spinner';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  const statCards = [
    {
      title: t('admin.totalCategories'),
      value: stats.totalCategories,
      icon: FolderOpen,
      to: '/admin/categories',
      color: 'bg-emerald-500/10 text-emerald-700',
    },
    {
      title: t('admin.totalProducts'),
      value: stats.totalProducts,
      icon: Coffee,
      to: '/admin/products',
      color: 'bg-amber-500/10 text-amber-700',
    },
    {
      title: t('admin.totalExtras'),
      value: stats.totalExtras,
      icon: Puzzle,
      to: '/admin/extras',
      color: 'bg-indigo-500/10 text-indigo-700',
    },
    {
      title: t('admin.visibleItems'),
      value: stats.visibleProducts,
      icon: Eye,
      to: '/admin/products',
      color: 'bg-brand-olive-500/10 text-brand-olive-700',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-espresso">
            {t('admin.dashboard')}
          </h1>
          <p className="text-xs md:text-sm text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'مرحباً بك في لوحة تحكم ٣+٢ قهوة مختصة'
              : 'Welcome to the 3+2 Specialty Coffee menu management portal'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/menu" target="_blank" className="btn-secondary text-xs">
            <span>{t('common.viewMenu')}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="card p-5 hover:shadow-brand-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-brand ${card.color}`}>
                <card.icon size={20} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-brand-olive-300 group-hover:text-brand-olive-600 transition-colors"
              />
            </div>
            <p className="text-xs font-medium text-brand-olive-500">{card.title}</p>
            <p className="text-2xl md:text-3xl font-bold font-serif text-brand-espresso mt-1">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-serif font-bold text-lg text-brand-espresso mb-4">
          {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.addProduct')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إضافة مشروب جديد للقائمة' : 'Add beverage with sizes & prices'}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.addCategory')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إضافة تصنيف جديد' : 'Create new menu section'}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/extras"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-espresso flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.addExtra')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إضافة خيار إضافي' : 'Add custom milk or syrup add-on'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
