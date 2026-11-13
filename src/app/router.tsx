import { createHashRouter, Navigate, useLocation } from 'react-router-dom';
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
        <a href="/#/" className="btn-primary text-xs">
          Return to 3+2 Specialty Coffee
        </a>
      </div>
    </div>
  );
}

export const router = createHashRouter([
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
]);
