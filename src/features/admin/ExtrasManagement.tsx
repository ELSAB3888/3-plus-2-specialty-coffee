import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useExtras } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { createExtra, updateExtra, deleteExtra } from '@/lib/adminApi';
import { formatPrice, localized } from '@/lib/utils';
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

  // Form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState<number>(10);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);

  const startCreate = () => {
    setEditingExtra(null);
    setNameEn('');
    setNameAr('');
    setPrice(10);
    setDisplayOrder(extras.length + 1);
    setIsAvailable(true);
    setIsCreating(true);
  };

  const startEdit = (extra: Extra) => {
    setIsCreating(false);
    setEditingExtra(extra);
    setNameEn(extra.name_en);
    setNameAr(extra.name_ar);
    setPrice(extra.price);
    setDisplayOrder(extra.display_order);
    setIsAvailable(extra.is_available);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) {
      toast('error', 'Please provide both English and Arabic names');
      return;
    }

    setSubmitting(true);
    const extraData = {
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      price: Number(price),
      display_order: Number(displayOrder),
      is_available: isAvailable,
    };

    try {
      if (editingExtra) {
        await updateExtra(editingExtra.id, extraData);
        toast('success', t('admin.saveSuccess'));
      } else {
        await createExtra(extraData);
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
      await deleteExtra(deletingExtra.id);
      toast('success', t('admin.deleteSuccess'));
      setDeletingExtra(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (extra: Extra) => {
    try {
      await updateExtra(extra.id, { is_available: !extra.is_available });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.extras')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar' ? 'إدارة الإضافات وخيارات التخصيص المستقلة' : 'Manage independent add-ons and drink customizations'}
          </p>
        </div>
        {!isCreating && !editingExtra && (
          <button onClick={startCreate} className="btn-primary text-xs self-start">
            <Plus size={16} />
            <span>{t('admin.addExtra')}</span>
          </button>
        )}
      </div>

      {/* Extras List */}
      <div className="card divide-y divide-brand-cream-200">
        {extras.map((extra) => (
          <div
            key={extra.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-brand-cream-200 text-brand-olive-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {extra.display_order}
              </span>
              <div className="min-w-0">
                <h3 className="font-medium text-sm text-brand-espresso truncate">
                  {localized(extra, 'name', language)}
                </h3>
                <p className="text-xs text-brand-olive-400 truncate">
                  {language === 'ar' ? extra.name_en : extra.name_ar}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="font-serif font-bold text-sm text-brand-olive">
                +{formatPrice(extra.price, language)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => void toggleAvailability(extra)}
                  className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                  title={extra.is_available ? t('admin.available') : t('admin.unavailable')}
                >
                  {extra.is_available ? <Eye size={16} /> : <EyeOff size={16} className="text-brand-olive-300" />}
                </button>
                <button
                  onClick={() => startEdit(extra)}
                  className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                  title={t('common.edit')}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeletingExtra(extra)}
                  className="p-2 rounded-brand text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {(isCreating || editingExtra) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-brand max-w-md w-full p-6 shadow-brand-lg border border-brand-cream-300 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-cream-200">
              <h2 className="font-serif text-lg font-bold text-brand-espresso">
                {editingExtra ? t('admin.editExtra') : t('admin.addExtra')}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingExtra(null);
                }}
                className="text-brand-olive-400 hover:text-brand-olive p-1 rounded-brand"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.nameEn')} *
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Vanilla Syrup"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.nameAr')} *
                </label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="input-field"
                  placeholder="مثال: سيروب فانيليا"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-espresso mb-1">
                    {t('admin.price')} (ج.م) *
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
                  <label className="block text-xs font-semibold text-brand-espresso mb-1">
                    {t('admin.order')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="extraAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-brand-cream-300 text-brand-olive focus:ring-brand-gold"
                />
                <label htmlFor="extraAvailable" className="text-xs font-medium text-brand-espresso cursor-pointer">
                  {t('admin.available')}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-brand-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingExtra(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs">
                  {submitting ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingExtra)}
        title={t('admin.deleteConfirmTitle')}
        description={t('admin.deleteConfirmDesc')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isDanger
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeletingExtra(null)}
      />
    </div>
  );
}
