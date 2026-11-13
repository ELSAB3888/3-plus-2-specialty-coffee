import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, X, Coffee, Layers, Upload } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  uploadImage,
} from '@/lib/adminApi';
import { localized, formatPrice } from '@/lib/utils';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingScreen } from '@/components/ui/Spinner';
import type { Product, ProductSize } from '@/types';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Pricing model
  const [isMultiSize, setIsMultiSize] = useState(false);
  const [singlePrice, setSinglePrice] = useState<number>(80);
  const [sizes, setSizes] = useState<SizeDraft[]>([]);

  const resetForm = () => {
    setNameEn('');
    setNameAr('');
    setCategoryId(categories[0]?.id || '');
    setDescEn('');
    setDescAr('');
    setImagePath(null);
    setDisplayOrder(products.length + 1);
    setIsVisible(true);
    setIsFeatured(false);
    setIsMultiSize(false);
    setSinglePrice(80);
    setSizes([
      { label_en: 'Regular', label_ar: 'وسط', price: 80, display_order: 1, is_available: true },
      { label_en: 'Large', label_ar: 'كبير', price: 95, display_order: 2, is_available: true },
    ]);
  };

  const startCreate = () => {
    resetForm();
    setEditingProduct(null);
    setIsCreating(true);
  };

  const startEdit = (prod: Product) => {
    setIsCreating(false);
    setEditingProduct(prod);

    setNameEn(prod.name_en || '');
    setNameAr(prod.name_ar || '');
    setCategoryId(prod.category_id);
    setDescEn(prod.description_en || '');
    setDescAr(prod.description_ar || '');
    setImagePath(prod.image || prod.image_url || null);
    setDisplayOrder(prod.display_order);
    setIsVisible(prod.is_visible);
    setIsFeatured(Boolean(prod.is_featured));

    const existingSizes: ProductSize[] = prod.sizes || prod.product_sizes || [];

    if (existingSizes.length <= 1) {
      setIsMultiSize(false);
      setSinglePrice(existingSizes[0]?.price ?? 80);
      setSizes([
        { label_en: 'Regular', label_ar: 'وسط', price: 80, display_order: 1, is_available: true },
        { label_en: 'Large', label_ar: 'كبير', price: 95, display_order: 2, is_available: true },
      ]);
    } else {
      setIsMultiSize(true);
      setSizes(
        existingSizes.map((s) => ({
          id: s.id,
          label_en: s.label_en,
          label_ar: s.label_ar,
          price: s.price,
          display_order: s.display_order,
          is_available: s.is_available,
        }))
      );
    }
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setImagePath(result.publicPath);
      toast('success', language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (err: any) {
      toast('error', err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add a new size draft row
  const addSizeRow = () => {
    setSizes((prev) => [
      ...prev,
      {
        label_en: '',
        label_ar: '',
        price: 20,
        display_order: prev.length + 1,
        is_available: true,
      },
    ]);
  };

  const removeSizeRow = (index: number) => {
    if (sizes.length <= 2) {
      toast('error', language === 'ar' ? 'يجب أن يحتوي المنتج متعدد الأحجام على حجمين على الأقل' : 'Multi-size products must have at least 2 sizes');
      return;
    }
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSizeField = (index: number, field: keyof SizeDraft, val: any) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameEn.trim() || !nameAr.trim()) {
      toast('error', 'Please provide both English and Arabic product names');
      return;
    }

    if (!categoryId) {
      toast('error', 'Please select a category');
      return;
    }

    let finalSizes: SizeDraft[] = [];

    if (!isMultiSize) {
      finalSizes = [
        {
          id: editingProduct?.sizes?.[0]?.id,
          label_en: 'Standard',
          label_ar: 'حجم قياسي',
          price: Number(singlePrice),
          display_order: 1,
          is_available: true,
        },
      ];
    } else {
      if (sizes.length === 0) {
        toast('error', 'Please add at least one size');
        return;
      }
      for (let i = 0; i < sizes.length; i++) {
        const sz = sizes[i];
        if (!sz || !sz.label_en.trim() || !sz.label_ar.trim()) {
          toast('error', `Size ${i + 1} requires both Arabic and English labels`);
          return;
        }
      }
      finalSizes = sizes.map((s, idx) => ({
        ...s,
        price: Number(s.price),
        display_order: idx + 1,
      }));
    }

    setSubmitting(true);

    const productPayload = {
      category_id: categoryId,
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      description_en: descEn.trim() || null,
      description_ar: descAr.trim() || null,
      image: imagePath,
      display_order: Number(displayOrder),
      is_visible: isVisible,
      is_featured: isFeatured,
      sizes: finalSizes,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        toast('success', t('admin.saveSuccess'));
      } else {
        await createProduct(productPayload);
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
      await deleteProduct(deletingProduct.id);
      toast('success', t('admin.deleteSuccess'));
      setDeletingProduct(null);
      void refetch();
    } catch (err: any) {
      toast('error', err.message || t('admin.deleteError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (prod: Product) => {
    try {
      await toggleProductAvailability(prod.id, !prod.is_visible);
      void refetch();
      toast('success', t('admin.saveSuccess'));
    } catch (err: any) {
      toast('error', err.message || t('admin.saveError'));
    }
  };

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  const filteredProducts =
    selectedCategoryId === 'all'
      ? products
      : products.filter((p) => p.category_id === selectedCategoryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-espresso">
            {t('admin.products')}
          </h1>
          <p className="text-xs text-brand-olive-500 mt-1">
            {language === 'ar'
              ? `إجمالي ${products.length} صنف مسجل في منيو 3+2`
              : `Total of ${products.length} menu items in 3+2 catalog`}
          </p>
        </div>
        {!isCreating && !editingProduct && (
          <button onClick={startCreate} className="btn-primary text-xs self-start">
            <Plus size={16} />
            <span>{t('admin.addProduct')}</span>
          </button>
        )}
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategoryId === 'all'
              ? 'bg-brand-olive text-white'
              : 'bg-white text-brand-olive-700 hover:bg-brand-cream-100 border border-brand-cream-300'
          }`}
        >
          {language === 'ar' ? 'الكل' : 'All'} ({products.length})
        </button>
        {categories.map((c) => {
          const count = products.filter((p) => p.category_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategoryId === c.id
                  ? 'bg-brand-olive text-white'
                  : 'bg-white text-brand-olive-700 hover:bg-brand-cream-100 border border-brand-cream-300'
              }`}
            >
              {localized(c, 'name', language)} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Table/Card list */}
      <div className="card divide-y divide-brand-cream-200">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-brand-olive-400">
            {language === 'ar' ? 'لا توجد أصناف في هذا القسم' : 'No products in this category'}
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const cat = categories.find((c) => c.id === prod.category_id);
            const sizesList = prod.sizes || prod.product_sizes || [];
            const hasMulti = sizesList.length > 1;
            const displayP = hasMulti
              ? Math.min(...sizesList.map((s) => s.price))
              : sizesList[0]?.price ?? 0;

            const imgSrc = prod.image || prod.image_url;

            return (
              <div
                key={prod.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-brand-cream-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-brand overflow-hidden bg-brand-cream-200 shrink-0 flex items-center justify-center">
                    {imgSrc ? (
                      <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee size={20} className="text-brand-olive-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-brand-espresso truncate">
                        {localized(prod, 'name', language)}
                      </h3>
                      {prod.is_featured && (
                        <Sparkles size={13} className="text-brand-gold shrink-0 fill-current" />
                      )}
                    </div>
                    <p className="text-xs text-brand-olive-400 truncate">
                      {cat ? localized(cat, 'name', language) : '—'} •{' '}
                      {hasMulti
                        ? `${sizesList.length} ${language === 'ar' ? 'أحجام' : 'sizes'}`
                        : `${formatPrice(displayP, language)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-serif font-bold text-sm text-brand-olive">
                    {hasMulti && <span className="text-[10px] text-brand-olive-400 me-1">From</span>}
                    {formatPrice(displayP, language)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => void handleToggleVisibility(prod)}
                      className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                      title={prod.is_visible ? t('admin.visible') : t('admin.hidden')}
                    >
                      {prod.is_visible ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} className="text-brand-olive-300" />
                      )}
                    </button>
                    <button
                      onClick={() => startEdit(prod)}
                      className="p-2 rounded-brand text-brand-olive-400 hover:text-brand-olive hover:bg-brand-cream-200 transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(prod)}
                      className="p-2 rounded-brand text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {(isCreating || editingProduct) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-brand max-w-2xl w-full p-6 shadow-brand-lg border border-brand-cream-300 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-cream-200">
              <h2 className="font-serif text-lg font-bold text-brand-espresso">
                {editingProduct ? t('admin.editProduct') : t('admin.addProduct')}
              </h2>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                }}
                className="text-brand-olive-400 hover:text-brand-olive p-1 rounded-brand"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="e.g. V60 Pour Over"
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
                    placeholder="مثال: قهوة V60 المقطرة"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-brand-espresso mb-1">
                  {t('admin.category')} *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                >
                  <option value="" disabled>
                    {language === 'ar' ? 'اختر القسم...' : 'Select a category...'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {localized(cat, 'name', language)} ({cat.name_en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Image Upload & Preview */}
              <div className="p-3 rounded-brand bg-brand-cream-50 border border-brand-cream-300">
                <label className="block text-xs font-semibold text-brand-espresso mb-2">
                  {language === 'ar' ? 'صورة المنتج' : 'Product Image'}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-brand overflow-hidden bg-brand-cream-200 border border-brand-cream-300 flex items-center justify-center shrink-0">
                    {imagePath ? (
                      <img src={imagePath} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee size={24} className="text-brand-olive-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="btn-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer">
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image (JPG/PNG/WebP)'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                    {imagePath && (
                      <p className="text-[10px] text-brand-olive-400 font-mono truncate max-w-sm">
                        {imagePath}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing Mode Toggle */}
              <div className="p-3 rounded-brand bg-brand-cream-50 border border-brand-cream-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-espresso flex items-center gap-1.5">
                    <Layers size={14} className="text-brand-olive" />
                    {language === 'ar' ? 'نظام التسعير' : 'Pricing Structure'}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsMultiSize(false)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        !isMultiSize
                          ? 'bg-brand-olive text-white'
                          : 'bg-brand-cream-200 text-brand-olive-600'
                      }`}
                    >
                      {language === 'ar' ? 'سعر موحد' : 'Single Price'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMultiSize(true)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        isMultiSize
                          ? 'bg-brand-olive text-white'
                          : 'bg-brand-cream-200 text-brand-olive-600'
                      }`}
                    >
                      {language === 'ar' ? 'أحجام متعددة' : 'Multiple Sizes'}
                    </button>
                  </div>
                </div>

                {!isMultiSize ? (
                  <div>
                    <label className="block text-xs text-brand-olive-600 mb-1">
                      {language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(parseFloat(e.target.value) || 0)}
                      className="input-field"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sizes.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Size (e.g. Regular)"
                          value={s.label_en}
                          onChange={(e) => updateSizeField(idx, 'label_en', e.target.value)}
                          className="input-field text-xs flex-1"
                          required
                        />
                        <input
                          type="text"
                          placeholder="الحجم (مثال: وسط)"
                          value={s.label_ar}
                          onChange={(e) => updateSizeField(idx, 'label_ar', e.target.value)}
                          className="input-field text-xs flex-1"
                          dir="rtl"
                          required
                        />
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="السعر"
                          value={s.price}
                          onChange={(e) =>
                            updateSizeField(idx, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="input-field text-xs w-20"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeSizeRow(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-brand"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSizeRow}
                      className="text-xs text-brand-olive hover:underline font-medium flex items-center gap-1 mt-1"
                    >
                      <Plus size={13} />
                      {language === 'ar' ? 'إضافة حجم آخر' : 'Add another size'}
                    </button>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-espresso">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="rounded border-brand-cream-300 text-brand-olive focus:ring-brand-gold"
                  />
                  <span>{t('admin.visible')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-brand-espresso">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-brand-cream-300 text-brand-olive focus:ring-brand-gold"
                  />
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-brand-gold fill-current" />
                    {t('common.featured')}
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-brand-cream-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        title={t('admin.deleteConfirmTitle')}
        description={t('admin.deleteConfirmDesc')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        isDanger
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
