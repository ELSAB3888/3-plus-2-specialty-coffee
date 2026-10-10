import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Coffee, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { hasValidSupabaseConfig } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { user, error } = await signIn(email, password);
      if (error || !user) {
        setErrorMsg(error || t('admin.loginError'));
        toast('error', error || t('admin.loginError'));
      } else {
        toast('success', t('admin.welcomeBack'));
        navigate(from, { replace: true });
      }
    } catch {
      setErrorMsg(t('admin.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('owner@3plus2coffee.com');
    setPassword('owner123');
  };

  return (
    <div className="min-h-screen bg-brand-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-brand shadow-brand-lg p-6 md:p-8 border border-brand-cream-300 animate-scale-in">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-olive text-brand-cream mx-auto flex items-center justify-center mb-3 shadow-brand-sm">
            <Coffee size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.loginTitle')}
          </h1>
          <p className="text-xs md:text-sm text-brand-olive-500 mt-1">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Demo Mode Notice */}
        {!hasValidSupabaseConfig && (
          <div className="mb-5 p-3 rounded-brand bg-brand-gold/15 border border-brand-gold/30 text-xs text-brand-espresso">
            <p className="font-semibold mb-1">
              {language === 'ar' ? 'وضع العرض التجريبي' : 'Development Demo Mode'}
            </p>
            <p className="text-brand-olive-600 mb-2">
              {language === 'ar'
                ? 'يمكنك تسجيل الدخول ببيانات تجريبية لمعاينة كافة وظائف الإدارة فوراً.'
                : 'You can test the owner panel with demo credentials right away.'}
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 rounded bg-brand-gold text-brand-espresso text-xs font-medium hover:bg-brand-gold-light transition-colors"
            >
              {language === 'ar' ? 'تعبئة بيانات المالك التجريبية' : 'Fill Demo Owner Credentials'}
            </button>
          </div>
        )}

        {/* Error alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-brand bg-red-50 border border-red-200 text-xs text-red-600 animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-espresso mb-1">
              {t('admin.email')}
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-olive-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@3plus2coffee.com"
                className="input-field ps-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-espresso mb-1">
              {t('admin.password')}
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-olive-400"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field ps-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            <span>{loading ? t('common.loading') : t('admin.loginButton')}</span>
            <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
          </button>
        </form>
      </div>
    </div>
  );
}
