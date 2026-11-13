import { createBrowserRouter, Navigate, useLocation, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HomePage } from '@/features/home/HomePage';
import { MenuPage } from '@/features/menu/MenuPage';
import { AdminLoginPage } from '@/features/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { CategoryManagement } from '@/features/admin/CategoryManagement';
import { ProductManagement } from '@/features/admin/ProductManagement';
import { ExtrasManagement } from '@/features/admin/ExtrasManagement';
import { QRCodeGeneratorPage } from '@/features/admin/QRCodeGeneratorPage';
import { PublicAdminNotice } from '@/features/admin/PublicAdminNotice';
import { useAuth, isLocalAdminEnvironment } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/ui/Spinner';

/** Route guard ensuring only authenticated local operator can access /admin */
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If visited from a public domain (Vercel / Cloudflare), block admin completely
  if (!isLocalAdminEnvironment()) {
    return <PublicAdminNotice />;
  }

  if (isLoading) {
    return <LoadingScreen message="Verifying authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/** 404 Fallback */
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream-100 p-4 text-center">
      <div className="card p-8 max-w-md">
        <h1 className="font-serif text-3xl font-bold text-brand-espresso mb-2">404</h1>
        <p className="text-sm text-brand-olive-500 mb-6">Page not found</p>
        <Link to="/" className="btn-primary text-xs">
          Return to 3+2 Specialty Coffee
        </Link>
      </div>
    </div>
  );
}

/** Determine router basename dynamically based on hosting environment */
function getBasename(): string {
  if (typeof window !== 'undefined') {
    // GitHub Pages deployment uses /3-plus-2-specialty-coffee as repository base
    if (window.location.pathname.startsWith('/3-plus-2-specialty-coffee')) {
      return '/3-plus-2-specialty-coffee';
    }
    // Local admin backend or localhost runs directly from root /
    if (
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === 'localhost'
    ) {
      return '/';
    }
  }
  return import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
}

// Seamless legacy hash redirect: if visited via /#/admin/login, migrate URL to /admin/login
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const hashPath = window.location.hash.slice(1);
  const basePrefix = window.location.pathname.startsWith('/3-plus-2-specialty-coffee')
    ? '/3-plus-2-specialty-coffee'
    : '';
  window.history.replaceState(null, '', basePrefix + hashPath);
}

export const router = createBrowserRouter(
  [
    // Public routes (Static customer website)
    {
      path: '/',
      element: <PublicLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'menu',
          element: <MenuPage />,
        },
      ],
    },
    // Admin Login
    {
      path: '/admin/login',
      element: <AdminLoginPage />,
    },
    // Protected Admin Routes (Strictly Local 127.0.0.1)
    {
      path: '/admin',
      element: (
        <ProtectedAdminRoute>
          <AdminLayout />
        </ProtectedAdminRoute>
      ),
      children: [
        {
          index: true,
          element: <AdminDashboardPage />,
        },
        {
          path: 'categories',
          element: <CategoryManagement />,
        },
        {
          path: 'products',
          element: <ProductManagement />,
        },
        {
          path: 'extras',
          element: <ExtrasManagement />,
        },
        {
          path: 'qr',
          element: <QRCodeGeneratorPage />,
        },
      ],
    },
    // Catch-all
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  {
    basename: getBasename(),
  }
);
