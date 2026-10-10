import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Sparkles } from 'lucide-react';
import { useExtras } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabase';
import { localized, formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingScreen } from '@/components/ui/Spinner';
import type { Extra } from '@/types';

export function ExtrasManagement() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { extras, loading, refetch } = useExtras();

  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingExtra, setDeletingExtra] = useState<Extra | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState<number>(4);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);

  const startCreate = () => {
    setEditingExtra(null);
    setNameEn('');
    setNameAr('');
    setPrice(4);
    setDisplayOrder(extras.length + 1);
    setIsAvailable(true);
    setIsCreating(true);
  };

  const startEdit = (e: Extra) => {
    setIsCreating(false);
    setEditingExtra(e);
    setNameEn(e.name_en);
    setNameAr(e.name_ar);
    setPrice(e.price);
    setDisplayOrder(e.display_order);
    setIsAvailable(e.is_available);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) {
      toast('error', 'Please provide both English and Arabic names');
      return;
    }

    setSubmitting(true);
    const payload = {
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      price: Number(price),
      display_order: Number(displayOrder),
      is_available: isAvailable,
    };

    try {
      if (editingExtra) {
        const { error } = await supabase
          .from('extras')
          .update(payload)
          .eq('id', editingExtra.id);
        if (error) throw error;
        toast('success', t('admin.saveSuccess'));
      } else {
        const { error } = await supabase
          .from('extras')
          .insert(payload);
        if (error) throw error;
        toast('success', t('admin.saveSuccess'));
      }

      setIsCreating(false);
      setEditingExtra(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExtra) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('extras')
        .delete()
        .eq('id', deletingExtra.id);
      if (error) throw error;
      toast('success', t('admin.deleteSuccess'));
      setDeletingExtra(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (e: Extra) => {
    try {
      const { error } = await supabase
        .from('extras')
        .update({ is_available: !e.is_available })
        .eq('id', e.id);
      if (error) throw error;
      void refetch();
      toast('success', t('admin.saveSuccess'));
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    }
  };

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.extras')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'إدارة خيارات الإضافات الحرفية وبدائل الحليب المعروضة بنهاية القائمة'
              : 'Manage signature add-ons, alternative milks, and syrup enhancements'}
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary text-xs">
          <Plus size={16} />
          <span>{t('admin.addExtra')}</span>
        </button>
      </div>

      {/* Editor Modal */}
      {(isCreating || editingExtra) && (
        <div className="card p-6 border-brand-olive/30 shadow-brand-md bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-brand-cream-300 pb-3">
            <h2 className="font-serif font-bold text-lg text-brand-espresso">
              {isCreating ? t('admin.addExtra') : t('admin.editExtra')}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingExtra(null);
              }}
              className="p-1 rounded-full hover:bg-brand-cream-200"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.nameEn')} *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Organic Oat Milk"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.nameAr')} *
                </label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: حليب شوفان عضوي"
                  className="input-field"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.price')} *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.displayOrder')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="input-field"
                />
              </div>

              <div className="pt-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="extra_available"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-olive"
                />
                <label htmlFor="extra_available" className="text-xs font-semibold text-brand-espresso cursor-pointer">
                  {t('common.available')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-cream-300">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingExtra(null);
                }}
                className="btn-ghost"
              >
                {t('common.cancel')}
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Extras list */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-brand-cream-200">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-espresso text-sm md:text-base">
                    {localized(extra, 'name', language)}
                  </h3>
                  <p className="text-xs text-brand-olive-600 font-serif font-bold">
                    +{formatPrice(extra.price, language)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => void toggleAvailability(extra)}
                  className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-500 transition-colors"
                  title={extra.is_available ? t('common.available') : t('common.unavailable')}
                >
                  {extra.is_available ? (
                    <Eye size={18} className="text-brand-olive" />
                  ) : (
                    <EyeOff size={18} className="text-brand-olive-300" />
                  )}
                </button>
                <button
                  onClick={() => startEdit(extra)}
                  className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-600 transition-colors"
                  title={t('common.edit')}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setDeletingExtra(extra)}
                  className="p-2 rounded-brand hover:bg-red-50 text-red-500 transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deletingExtra)}
        onClose={() => setDeletingExtra(null)}
        onConfirm={() => void handleDelete()}
        title={t('admin.deleteExtra')}
        message={t('admin.deleteExtraConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
