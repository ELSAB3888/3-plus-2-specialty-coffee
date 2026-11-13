import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Coffee, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth, isLocalAdminEnvironment } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { PublicAdminNotice } from './PublicAdminNotice';

export function AdminLoginPage() {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLocal = isLocalAdminEnvironment();

  const [adminToken, setAdminTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If accessed from a public domain, display the security notice immediately
  if (!isLocal) {
    return <PublicAdminNotice />;
  }

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const token = adminToken.trim();
    if (!token) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال رمز الإدارة المحلي' : 'Please enter the local admin key');
      setLoading(false);
      return;
    }

    try {
      // Validate token with local backend
      const res = await fetch('http://127.0.0.1:3001/api/git/status', {
        headers: {
          'X-Admin-Token': token,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(language === 'ar' ? 'رمز الإدارة غير صحيح' : 'Invalid admin key');
        } else if (res.status === 403) {
          throw new Error(language === 'ar' ? 'تم رفض الاتصال (CORS/Origin)' : 'Connection rejected by local security');
        } else {
          // If git status returned something else or backend is connecting
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Backend authorization failed');
        }
      }

      loginWithToken(token);
      toast('success', language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Admin session verified');
      navigate(from, { replace: true });
    } catch (err: any) {
      // If server is unreachable
      if (err.message && err.message.includes('Failed to fetch')) {
        setErrorMsg(
          language === 'ar'
            ? 'تعذر الاتصال بالخادم المحلي (127.0.0.1:3001). يرجى تشغيل start-admin.bat أولاً.'
            : 'Could not connect to local backend (127.0.0.1:3001). Please run start-admin.bat first.'
        );
      } else {
        setErrorMsg(err.message || 'Authorization failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillLocalDefault = () => {
    // Hint only — the actual token must be looked up from admin-server/.env
    toast('info', language === 'ar'
      ? 'ابحث عن الرمز في ملف admin-server/.env (المتغير ADMIN_TOKEN)'
      : 'Find the token in admin-server/.env (the ADMIN_TOKEN variable)');
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
            {language === 'ar' ? 'إدارة 3+2 كافيه' : '3+2 Café Administration'}
          </h1>
          <p className="text-xs md:text-sm text-brand-olive-500 mt-1">
            {language === 'ar' ? 'تسجيل الدخول لمحطة العمل المحلية (127.0.0.1)' : 'Local Workstation Access (127.0.0.1)'}
          </p>
        </div>

        {/* Local Security Badge */}
        <div className="mb-5 p-3 rounded-brand bg-brand-olive-50 border border-brand-olive-200 text-xs text-brand-olive-800 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-brand-olive-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">
              {language === 'ar' ? 'محطة إدارة محلية مؤمنة' : 'Secure Local Station'}
            </p>
            <p className="text-brand-olive-600 text-[11px] leading-relaxed">
              {language === 'ar'
                ? 'يتم تخزين التعديلات والصور محلياً ونشرها إلى GitHub والإنترنت بأمان.'
                : 'Changes and images are saved locally and published to GitHub securely.'}
            </p>
          </div>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-brand bg-red-50 border border-red-200 text-xs text-red-600 animate-fade-in leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-espresso mb-1">
              {language === 'ar' ? 'رمز مفتاح الإدارة المحلي (Admin Key)' : 'Local Admin Secret Key'}
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-olive-400"
              />
              <input
                type="password"
                required
                value={adminToken}
                onChange={(e) => setAdminTokenInput(e.target.value)}
                placeholder="••••••••••••••••"
                className="input-field ps-9 text-xs md:text-sm font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            <span>{loading ? t('common.loading') : (language === 'ar' ? 'تأكيد الدخول' : 'Verify & Enter')}</span>
            <ArrowRight size={16} className={cn(isRTL && 'rotate-180')} />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleFillLocalDefault}
              className="text-[11px] text-brand-olive-500 hover:text-brand-olive underline"
            >
              {language === 'ar' ? 'استخدام الرمز الافتراضي لمحطة العمل' : 'Use default workstation key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
