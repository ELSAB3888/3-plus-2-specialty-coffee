import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useCategories, useProducts } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabase';
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
      description_en: descEn.trim() || null,
      description_ar: descAr.trim() || null,
      display_order: Number(displayOrder),
      is_visible: isVisible,
    };

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast('success', t('admin.saveSuccess'));
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
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
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deletingCategory.id);
      if (error) throw error;
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
      const { error } = await supabase
        .from('categories')
        .update({ is_visible: !cat.is_visible })
        .eq('id', cat.id);
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
            {t('admin.categories')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'إدارة أقسام وتصنيفات القائمة والتحكم بظهورها وترتيبها'
              : 'Organize menu sections, bilingual descriptions, and display sequence'}
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary text-xs">
          <Plus size={16} />
          <span>{t('admin.addCategory')}</span>
        </button>
      </div>

      {/* Editor Modal / Drawer */}
      {(isCreating || editingCategory) && (
        <div className="card p-6 border-brand-olive/30 shadow-brand-md bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-brand-cream-300 pb-3">
            <h2 className="font-serif font-bold text-lg text-brand-espresso">
              {isCreating ? t('admin.addCategory') : t('admin.editCategory')}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingCategory(null);
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
                  onChange={(e) => {
                    setNameEn(e.target.value);
                    if (isCreating && !slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Espresso Bar"
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
                  placeholder="مثال: بار الإسبريسو"
                  className="input-field"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.descriptionEn')}
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="input-field resize-none"
                  placeholder="Brief description of this section"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.descriptionAr')}
                </label>
                <textarea
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="input-field resize-none"
                  placeholder="وصف مختصر للقسم"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.slug')}
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="espresso-bar"
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
                  id="category_visible"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-olive"
                />
                <label htmlFor="category_visible" className="text-xs font-semibold text-brand-espresso cursor-pointer">
                  {t('common.visible')}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-cream-300">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCategory(null);
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

      {/* Categories Table / List */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-brand-cream-200">
          {categories.map((cat) => {
            const itemCount = products.filter((p) => p.category_id === cat.id).length;

            return (
              <div
                key={cat.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-brand-cream-200 text-brand-espresso flex items-center justify-center text-xs font-bold shrink-0">
                    {cat.display_order}
                  </span>
                  <div>
                    <h3 className="font-semibold text-brand-espresso text-sm md:text-base flex items-center gap-2">
                      <span>{localized(cat, 'name', language)}</span>
                      <span className="text-xs text-brand-olive-400 font-normal">
                        ({itemCount} {language === 'ar' ? 'منتجات' : 'items'})
                      </span>
                    </h3>
                    <p className="text-xs text-brand-olive-400">
                      {cat.name_en} / {cat.name_ar}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => void toggleVisibility(cat)}
                    className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-500 transition-colors"
                    title={cat.is_visible ? t('common.visible') : t('common.hidden')}
                  >
                    {cat.is_visible ? (
                      <Eye size={18} className="text-brand-olive" />
                    ) : (
                      <EyeOff size={18} className="text-brand-olive-300" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-600 transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeletingCategory(cat)}
                    className="p-2 rounded-brand hover:bg-red-50 text-red-500 transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safe Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => void handleDelete()}
        title={t('admin.deleteCategory')}
        message={t('admin.deleteCategoryConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
