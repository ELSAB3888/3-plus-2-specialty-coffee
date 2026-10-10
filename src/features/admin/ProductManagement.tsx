import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, X, Coffee, Layers } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/lib/supabase';
import { localized, formatPrice, generateStorageFilename } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { LoadingScreen } from '@/components/ui/Spinner';
import type { ProductWithSizes } from '@/types';

interface SizeDraft {
  id?: string;
  label_en: string;
  label_ar: string;
  price: number;
  display_order: number;
  is_available: boolean;
}

export function ProductManagement() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { categories } = useCategories();
  const { products, loading, refetch } = useProducts();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<ProductWithSizes | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithSizes | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Pricing model
  const [isMultiSize, setIsMultiSize] = useState(false);
  const [singlePrice, setSinglePrice] = useState<number>(20);
  const [sizes, setSizes] = useState<SizeDraft[]>([]);

  const resetForm = () => {
    setNameEn('');
    setNameAr('');
    setCategoryId(categories[0]?.id || '');
    setDescEn('');
    setDescAr('');
    setImageUrl(null);
    setDisplayOrder(products.length + 1);
    setIsVisible(true);
    setIsFeatured(false);
    setIsMultiSize(false);
    setSinglePrice(20);
    setSizes([
      { label_en: 'Standard', label_ar: 'حجم قياسي', price: 20, display_order: 1, is_available: true },
    ]);
  };

  const startCreate = () => {
    setEditingProduct(null);
    resetForm();
    setIsCreating(true);
  };

  const startEdit = (p: ProductWithSizes) => {
    setIsCreating(false);
    setEditingProduct(p);
    setNameEn(p.name_en);
    setNameAr(p.name_ar);
    setCategoryId(p.category_id);
    setDescEn(p.description_en || '');
    setDescAr(p.description_ar || '');
    setImageUrl(p.image_url);
    setDisplayOrder(p.display_order);
    setIsVisible(p.is_visible);
    setIsFeatured(p.is_featured);

    const prodSizes = p.product_sizes || [];
    if (prodSizes.length > 1) {
      setIsMultiSize(true);
      setSizes(
        prodSizes.map((s) => ({
          id: s.id,
          label_en: s.label_en,
          label_ar: s.label_ar,
          price: s.price,
          display_order: s.display_order,
          is_available: s.is_available,
        }))
      );
    } else {
      setIsMultiSize(false);
      const firstSize = prodSizes[0];
      setSinglePrice(firstSize?.price ?? 20);
      setSizes(
        firstSize
          ? [
              {
                id: firstSize.id,
                label_en: firstSize.label_en,
                label_ar: firstSize.label_ar,
                price: firstSize.price,
                display_order: 1,
                is_available: true,
              },
            ]
          : [{ label_en: 'Standard', label_ar: 'حجم قياسي', price: 20, display_order: 1, is_available: true }]
      );
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const filename = generateStorageFilename(file.name);
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(`products/${filename}`, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(data.path);

      setImageUrl(publicUrlData.publicUrl);
      toast('success', 'Image uploaded successfully');
      return publicUrlData.publicUrl;
    } catch (err: any) {
      toast('error', err.message || 'Image upload failed');
      return null;
    }
  };

  const handleAddSize = () => {
    setSizes((prev) => [
      ...prev,
      {
        label_en: '',
        label_ar: '',
        price: singlePrice,
        display_order: prev.length + 1,
        is_available: true,
      },
    ]);
  };

  const handleRemoveSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !nameAr.trim()) {
      toast('error', 'Please provide both English and Arabic names');
      return;
    }
    if (!categoryId) {
      toast('error', 'Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      // Build final sizes array
      const finalSizes = isMultiSize
        ? sizes.map((s, idx) => ({
            id: s.id || `size-${Date.now()}-${idx}`,
            label_en: s.label_en.trim() || `Size ${idx + 1}`,
            label_ar: s.label_ar.trim() || `حجم ${idx + 1}`,
            price: Number(s.price),
            display_order: idx + 1,
            is_available: s.is_available,
          }))
        : [
            {
              id: sizes[0]?.id || `size-${Date.now()}-0`,
              label_en: 'Standard',
              label_ar: 'حجم قياسي',
              price: Number(singlePrice),
              display_order: 1,
              is_available: true,
            },
          ];

      const productPayload = {
        category_id: categoryId,
        name_en: nameEn.trim(),
        name_ar: nameAr.trim(),
        description_en: descEn.trim() || null,
        description_ar: descAr.trim() || null,
        image_url: imageUrl,
        display_order: Number(displayOrder),
        is_visible: isVisible,
        is_featured: isFeatured,
        product_sizes: finalSizes,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast('success', t('admin.saveSuccess'));
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productPayload);
        if (error) throw error;
        toast('success', t('admin.saveSuccess'));
      }

      setIsCreating(false);
      setEditingProduct(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);
      if (error) throw error;
      toast('success', t('admin.deleteSuccess'));
      setDeletingProduct(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVisibility = async (p: ProductWithSizes) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_visible: !p.is_visible })
        .eq('id', p.id);
      if (error) throw error;
      void refetch();
      toast('success', t('admin.saveSuccess'));
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    }
  };

  const filteredProducts = selectedCategoryId === 'all'
    ? products
    : products.filter((p) => p.category_id === selectedCategoryId);

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.products')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'إدارة أسعار ومواصفات المشروبات والأحجام والصور'
              : 'Manage menu items, prices, multiple size options, and photography'}
          </p>
        </div>
        <button onClick={startCreate} className="btn-primary text-xs">
          <Plus size={16} />
          <span>{t('admin.addProduct')}</span>
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
            selectedCategoryId === 'all'
              ? 'bg-brand-olive text-brand-cream'
              : 'bg-white text-brand-olive-700 border border-brand-cream-300'
          }`}
        >
          {t('common.allCategories')} ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategoryId(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              selectedCategoryId === c.id
                ? 'bg-brand-olive text-brand-cream'
                : 'bg-white text-brand-olive-700 border border-brand-cream-300'
            }`}
          >
            {localized(c, 'name', language)}
          </button>
        ))}
      </div>

      {/* Product Form Drawer/Modal */}
      {(isCreating || editingProduct) && (
        <div className="card p-6 border-brand-olive/30 shadow-brand-md bg-white">
          <div className="flex items-center justify-between mb-4 border-b border-brand-cream-300 pb-3">
            <h2 className="font-serif font-bold text-lg text-brand-espresso">
              {isCreating ? t('admin.addProduct') : t('admin.editProduct')}
            </h2>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
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
                  placeholder="e.g. V60 Ethiopian Gesha"
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
                  placeholder="مثال: V60 إثيوبيا قيشا"
                  className="input-field"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.selectCategory')} *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_en} — {c.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="pt-6 flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded text-brand-olive"
                    />
                    <span>{t('common.visible')}</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-brand-gold"
                    />
                    <span>{t('admin.isFeatured')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bilingual descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t('admin.descriptionEn')}
                </label>
                <textarea
                  rows={2}
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  className="input-field resize-none text-xs"
                  placeholder="Tasting notes, processing method, farm origin..."
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
                  className="input-field resize-none text-xs"
                  placeholder="إيحاءات التذوق، طريقة المعالجة، المزرعة..."
                  dir="rtl"
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                {t('admin.image')}
              </label>
              <ImageUpload
                currentUrl={imageUrl}
                onUpload={handleImageUpload}
                onRemove={async () => setImageUrl(null)}
              />
            </div>

            {/* Pricing Model (Single Price vs Multi-Sizes) */}
            <div className="p-4 rounded-brand bg-brand-cream-100/70 border border-brand-cream-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-espresso flex items-center gap-1.5">
                  <Layers size={14} className="text-brand-olive" />
                  {t('admin.pricingType')}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMultiSize(false)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      !isMultiSize
                        ? 'bg-brand-olive text-white shadow-xs'
                        : 'bg-white text-brand-olive-700'
                    }`}
                  >
                    {t('admin.singlePrice')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultiSize(true);
                      if (sizes.length === 0) handleAddSize();
                    }}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      isMultiSize
                        ? 'bg-brand-olive text-white shadow-xs'
                        : 'bg-white text-brand-olive-700'
                    }`}
                  >
                    {t('admin.multipleSizes')}
                  </button>
                </div>
              </div>

              {!isMultiSize ? (
                <div>
                  <label className="block text-xs font-medium mb-1">
                    {t('admin.price')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(parseFloat(e.target.value) || 0)}
                    className="input-field max-w-xs"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-brand-olive-500">
                      {language === 'ar' ? 'حدد خيارات الأحجام وأسعارها' : 'Define named size options & prices'}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="text-xs text-brand-olive hover:underline font-semibold flex items-center gap-1"
                    >
                      <Plus size={12} />
                      {t('admin.addSize')}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sizes.map((sz, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-brand-cream-300"
                      >
                        <input
                          type="text"
                          required
                          value={sz.label_en}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSizes((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, label_en: val } : s))
                            );
                          }}
                          placeholder="Small (8oz)"
                          className="input-field py-1.5 text-xs flex-1"
                        />
                        <input
                          type="text"
                          required
                          value={sz.label_ar}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSizes((prev) =>
                              prev.map((s, i) => (i === index ? { ...s, label_ar: val } : s))
                            );
                          }}
                          placeholder="صغير (٢٤٠ مل)"
                          className="input-field py-1.5 text-xs flex-1"
                          dir="rtl"
                        />
                        <div className="w-24">
                          <input
                            type="number"
                            step="0.5"
                            required
                            value={sz.price}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSizes((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, price: val } : s))
                              );
                            }}
                            placeholder="Price"
                            className="input-field py-1.5 text-xs"
                          />
                        </div>
                        {sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title={t('admin.removeSize')}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-cream-300">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
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

      {/* Products List */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-brand-cream-200">
          {filteredProducts.map((p) => {
            const minPrice = p.product_sizes.length > 0
              ? Math.min(...p.product_sizes.map((s) => s.price))
              : 0;

            return (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name_en}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 border border-brand-cream-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-brand-cream-200 flex items-center justify-center shrink-0">
                      <Coffee size={20} className="text-brand-olive-300" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-semibold text-brand-espresso text-sm md:text-base flex items-center gap-2 truncate">
                      <span>{localized(p, 'name', language)}</span>
                      {p.is_featured && (
                        <Sparkles size={12} className="text-brand-gold shrink-0" />
                      )}
                    </h3>
                    <p className="text-xs text-brand-olive-500">
                      {p.product_sizes.length > 1
                        ? `${p.product_sizes.length} sizes · From ${formatPrice(minPrice, language)}`
                        : formatPrice(minPrice, language)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => void toggleVisibility(p)}
                    className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-500 transition-colors"
                    title={p.is_visible ? t('common.visible') : t('common.hidden')}
                  >
                    {p.is_visible ? (
                      <Eye size={18} className="text-brand-olive" />
                    ) : (
                      <EyeOff size={18} className="text-brand-olive-300" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2 rounded-brand hover:bg-brand-cream-200 text-brand-olive-600 transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(p)}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => void handleDelete()}
        title={t('admin.deleteProduct')}
        message={t('admin.deleteProductConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
