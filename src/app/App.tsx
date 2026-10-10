import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastContainer } from '@/components/ui/Toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useEffect } from 'react';

export function App() {
  const { language, direction } = useLanguage();

  // Keep html tag synchronized with active language and direction
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}
