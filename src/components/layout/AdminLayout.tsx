import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderOpen,
  Coffee,
  Puzzle,
  QrCode,
  LogOut,
  Languages,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { LoadingScreen } from '@/components/ui/Spinner';

export function AdminLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const { toggleLanguage, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  if (!isAuthenticated) {
    // Will be redirected by router guard
    return null;
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), exact: true },
    { to: '/admin/categories', icon: FolderOpen, label: t('admin.categories') },
    { to: '/admin/products', icon: Coffee, label: t('admin.products') },
    { to: '/admin/extras', icon: Puzzle, label: t('admin.extras') },
    { to: '/admin/qr', icon: QrCode, label: isRTL ? 'رمز QR للطاولات' : 'Table QR Codes' },
  ];

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-brand-cream-100">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 z-50 w-64 bg-white border-e border-brand-cream-300',
          'flex flex-col transition-transform duration-300 lg:translate-x-0',
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-brand-cream-200">
          <div className="w-8 h-8 rounded-full bg-brand-olive flex items-center justify-center">
            <Coffee size={16} className="text-brand-cream" />
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-brand-espresso">3+2</span>
            <p className="text-[9px] text-brand-olive-400 uppercase tracking-widest">Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-brand text-sm font-medium transition-all duration-200',
                isActive(item.to, item.exact)
                  ? 'bg-brand-olive text-brand-cream shadow-brand-sm'
                  : 'text-brand-olive-600 hover:bg-brand-olive-50'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 space-y-1 border-t border-brand-cream-200">
          <Link
            to="/menu"
            className="flex items-center gap-3 px-4 py-2.5 rounded-brand text-sm font-medium text-brand-olive-400 hover:bg-brand-olive-50 transition-colors"
          >
            <ChevronLeft size={18} />
            {t('menu.title')}
          </Link>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-3 px-4 py-2.5 rounded-brand text-sm font-medium text-brand-olive-400 hover:bg-brand-olive-50 transition-colors w-full"
          >
            <Languages size={18} />
            {t('common.switchLang')}
          </button>
          <button
            onClick={() => void handleSignOut()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-brand text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut size={18} />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center gap-3 px-4 bg-white border-b border-brand-cream-300">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-brand hover:bg-brand-olive-50 text-brand-olive-600 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif font-bold text-brand-espresso">
            {t('admin.title')}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
