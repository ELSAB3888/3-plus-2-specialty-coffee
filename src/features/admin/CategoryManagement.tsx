import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useCategories, useProducts } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { createCategory, updateCategory, deleteCategory } from '@/lib/adminApi';
import { slugify, localized } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingScreen } from '@/components/ui/Spinner';
import type { Category } from '@/types';

export function CategoryManagement() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories, loading, refetch } = useCategories();
  const { products } = useProducts();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const startCreate = () => {
    setEditingCategory(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setDescEn('');
    setDescAr('');
    setDisplayOrder(categories.length + 1);
    setIsVisible(true);
    setIsCreating(true);
  };

  const startEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setNameEn(cat.name_en);
    setNameAr(cat.name_ar);
    setSlug(cat.slug);
    setDescEn(cat.description_en || '');
    setDescAr(cat.description_ar || '');
    setDisplayOrder(cat.display_order);
    setIsVisible(cat.is_visible);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) {
      toast('error', 'Please provide both English and Arabic names');
      return;
    }

    setSubmitting(true);
    const categoryData = {
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      slug: slug.trim() || slugify(nameEn),
      description_en: descEn.trim() || '',
      description_ar: descAr.trim() || '',
      display_order: Number(displayOrder),
      is_visible: isVisible,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
        toast('success', t('admin.saveSuccess'));
      } else {
        await createCategory(categoryData);
        toast('success', t('admin.saveSuccess'));
      }

      setIsCreating(false);
      setEditingCategory(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    // Safety check: count products in category
    const productCount = products.filter((p) => p.category_id === deletingCategory.id).length;
    if (productCount > 0) {
      toast(
        'error',
        t('admin.categoryHasProducts', { count: productCount })
      );
      setDeletingCategory(null);
      return;
    }

    setSubmitting(true);
    try {
      await deleteCategory(deletingCategory.id);
      toast('success', t('admin.deleteSuccess'));
      setDeletingCategory(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { is_visible: !cat.is_visible });
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.categories')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar' ? 'إدارة أقسام المنيو وترتيب عرضها' : 'Manage menu sections and display order'}
          </p>
        </div>
        {!isCreating && !editingCategory && (
          <button onClick={startCreate} className="btn-primary text-xs self-start">
            <Plus size={16} />
            <span>{t('admin.addCategory')}</span>
          </button>
        )}
      </div>

      {/* Category List */}
      <div className="card divide-y divide-brand-cream-200">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-6 h-6 rounded-full bg-brand-cream-200 text-brand-olive-600 text-xs font-semibold flex items-center justify-center shrink-0">
                {cat.display_order}
              </span>
              <div className="min-w-0">
                <h3 className="font-medium text-sm text-brand-espresso truncate">
                  {localized(cat, 'name', language)}
                </h3>
                <p className="text-xs text-brand-olive-400 truncate">
                  {language === 'ar' ? cat.name_en : cat.name_ar} • /{cat.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => void toggleVisibility(cat)}
                className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                title={cat.is_visible ? t('admin.visible') : t('admin.hidden')}
              >
                {cat.is_visible ? <Eye size={16} /> : <EyeOff size={16} className="text-brand-olive-300" />}
              </button>
              <button
                onClick={() => startEdit(cat)}
                className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                title={t('common.edit')}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setDeletingCategory(cat)}
                className="p-2 rounded-brand text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title={t('common.delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form Modal */}
      {(isCreating || editingCategory) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-brand max-w-lg w-full p-6 shadow-brand-lg border border-brand-cream-300 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-cream-200">
              <h2 className="font-serif text-lg font-bold text-brand-espresso">
                {editingCategory ? t('admin.editCategory') : t('admin.addCategory')}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
                }}
                className="text-brand-olive-400 hover:text-brand-olive p-1 rounded-brand"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-espresso mb-1">
                    {t('admin.nameEn')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => {
                      setNameEn(e.target.value);
                      if (!editingCategory) setSlug(slugify(e.target.value));
                    }}
                    className="input-field"
                    placeholder="e.g. Hot Coffee"
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
                    placeholder="مثال: قهوة ساخنة"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.slug')}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="input-field font-mono text-xs"
                  placeholder="hot-coffee"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.descEn')}
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.descAr')}
                </label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="input-field"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded border-brand-cream-300 text-brand-olive focus:ring-brand-gold"
                  />
                  <label htmlFor="isVisible" className="text-xs font-medium text-brand-espresso cursor-pointer">
                    {t('admin.visible')}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-brand-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
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
        isOpen={Boolean(deletingCategory)}
        title={t('admin.deleteConfirmTitle')}
        description={t('admin.deleteConfirmDesc')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isDanger
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
