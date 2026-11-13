import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PublicAdminNotice() {
  return (
    <div className="min-h-screen bg-brand-cream-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-brand shadow-brand-lg p-6 md:p-8 text-center border border-brand-cream-300">
        <div className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>

        <h1 className="font-serif text-2xl font-bold text-brand-espresso mb-2">
          لوحة الإدارة المحلية فقط
        </h1>
        <h2 className="font-serif text-sm font-semibold text-brand-olive-600 mb-4">
          Local Administration Workstation Only
        </h2>

        <p className="text-xs md:text-sm text-brand-olive-600 mb-4 leading-relaxed">
          نظام إدارة منيو 3+2 محمي ويعمل حصرياً داخل شبكة جهاز الكافيه المحلي عبر (127.0.0.1). لا يمكن إدارة البيانات أو تعديلها من خلال الموقع العام المنشور على الإنترنت لحماية بيانات الأسعار والمنتجات.
        </p>

        <p className="text-xs text-brand-olive-400 mb-6 leading-relaxed">
          The 3+2 admin system operates strictly on the dedicated local café workstation. Public visitors cannot perform write or administrative actions.
        </p>

        <Link to="/menu" className="btn-primary w-full inline-block text-center text-xs md:text-sm py-2.5">
          العودة إلى قائمة المشروبات — View Menu
        </Link>
      </div>
    </div>
  );
}

