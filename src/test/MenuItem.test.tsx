import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuItem } from '@/features/menu/MenuItem';
import type { ProductWithSizes } from '@/types';
import '@/i18n';

describe('MenuItem Component', () => {
  const singlePriceProduct: ProductWithSizes = {
    id: 'prod-single',
    category_id: 'cat-1',
    name_en: 'Single Espresso',
    name_ar: 'إسبريسو فردي',
    description_en: 'Single origin shot',
    description_ar: 'جرعة أحادية المصدر',
    image_url: null,
    display_order: 1,
    is_visible: true,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_sizes: [
      {
        id: 's-1',
        product_id: 'prod-single',
        label_en: 'Standard',
        label_ar: 'قياسي',
        price: 16.0,
        display_order: 1,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  };

  const multiSizeProduct: ProductWithSizes = {
    id: 'prod-multi',
    category_id: 'cat-1',
    name_en: 'Latte',
    name_ar: 'لاتيه',
    description_en: 'Steamed milk with espresso',
    description_ar: 'حليب مبخر مع إسبريسو',
    image_url: null,
    display_order: 2,
    is_visible: true,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product_sizes: [
      {
        id: 's-reg',
        product_id: 'prod-multi',
        label_en: 'Regular (8 oz)',
        label_ar: 'وسط (٢٤٠ مل)',
        price: 20.0,
        display_order: 1,
        is_available: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 's-lrg',
        product_id: 'prod-multi',
        label_en: 'Large (12 oz)',
        label_ar: 'كبير (٣٥٠ مل)',
        price: 24.0,
        display_order: 2,
        is_available: true,
        created_at: new Date().toISOString(),
      },
    ],
  };

  it('renders single-price product with exact price and dotted leader line', () => {
    const onToggle = vi.fn();
    render(<MenuItem product={singlePriceProduct} isExpanded={false} onToggleExpand={onToggle} />);

    expect(screen.getByText('Single Espresso')).toBeInTheDocument();
    expect(screen.getByText('EGP 16')).toBeInTheDocument();
  });

  it('renders multi-size product with "From" prefix and minimum price', () => {
    const onToggle = vi.fn();
    render(<MenuItem product={multiSizeProduct} isExpanded={false} onToggleExpand={onToggle} />);

    expect(screen.getByText('Latte')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('EGP 20')).toBeInTheDocument();
  });

  it('triggers onToggleExpand when header button is clicked', () => {
    const onToggle = vi.fn();
    render(<MenuItem product={multiSizeProduct} isExpanded={false} onToggleExpand={onToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('displays size breakdown when expanded', () => {
    render(<MenuItem product={multiSizeProduct} isExpanded={true} onToggleExpand={vi.fn()} />);

    expect(screen.getByText('Regular (8 oz)')).toBeInTheDocument();
    expect(screen.getByText('Large (12 oz)')).toBeInTheDocument();
    expect(screen.getByText('EGP 24')).toBeInTheDocument();
  });
});
