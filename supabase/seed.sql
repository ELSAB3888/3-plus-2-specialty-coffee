-- ==============================================================================
-- 3+2 SPECIALTY COFFEE — SEED DATA
-- ==============================================================================

-- 1. Insert Categories
insert into public.categories (id, name_en, name_ar, slug, description_en, description_ar, display_order, is_visible)
values
(
    '11111111-1111-1111-1111-111111111111',
    'Espresso Bar',
    'بار الإسبريسو',
    'espresso-bar',
    'Precision extractions calibrated daily for optimal sweetness and clarity.',
    'استخلاصات دقيقة تُضبط يومياً لإبراز حلاوة ونقاء النكهة.',
    1,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Manual Filter & Pour Over',
    'التقطير والفلتر اليدوي',
    'filter-pourover',
    'Single-origin micro-lots brewed with V60, Origami, and Aeropress.',
    'محاصيل فردية نادرة تُحضر بأدوات V60 وأوريغامي وإيروبرس.',
    2,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Signature & Cold Brew',
    'المشروبات المبتكرة والمثلجة',
    'signature-cold',
    'Craft coffee creations and slow 16-hour cold extractions.',
    'ابتكارات خاصة واستخلاص بطيء على البارد لمدة ١٦ ساعة.',
    3,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Artisan Pastries & Treats',
    'المخبوزات والحلويات الحرفية',
    'pastries',
    'Freshly baked morning pastries and desserts paired for our roast profiles.',
    'مخبوزات طازجة وحلويات مختارة بعناية لتتناغم مع إيحاءات القهوة.',
    4,
    true
)
on conflict (id) do nothing;

-- 2. Insert Products
insert into public.products (id, category_id, name_en, name_ar, description_en, description_ar, image_url, display_order, is_visible, is_featured)
values
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Single-Origin Espresso',
    'إسبريسو فردي المصدر',
    'Double shot dialled from high-altitude Ethiopian Yirgacheffe. Jasmine florals, bergamot, and sweet stone fruit.',
    'جرعة مزدوجة من محصول يرقاتشيفي الإثيوبي. إيحاءات ياسمين، برغموت، وفاكهة حجرية ناعمة.',
    'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80',
    1,
    true,
    true
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Cortado 3+2',
    'كورتادو ٣+٢',
    'Equal parts velvety micro-foamed milk and intense espresso. Perfectly balanced ratio.',
    'نسبة متساوية من الحليب المبخر المخملي والإسبريسو المركز. قوام غني ومتوازن.',
    'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    2,
    true,
    true
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Flat White',
    'فلات وايت',
    'Double ristretto with silky textured milk and fine micro-foam. Notes of milk chocolate and roasted almond.',
    'ريستريتو مزدوج مع حليب ناعم ورغوة حريرية دقيقة. إيحاءات شوكولاتة بالحليب ولوز محمص.',
    'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=800&q=80',
    3,
    true,
    false
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'Artisan Latte',
    'لاتيه الحرفي',
    'Creamy steamed milk poured over rich espresso with custom latte art.',
    'حليب كريمي مبخر يُسكب فوق إسبريسو غني مع رسمة فنية متقنة.',
    'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=800&q=80',
    4,
    true,
    false
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'V60 Ethiopian Gesha Village',
    'V60 إثيوبيا قيشا فيليدج',
    'Natural process Gesha. Explosive notes of peach nectar, orange blossom honey, and wild strawberry.',
    'معالجة مجففة لمزرعة قيشا فيليدج. إيحاءات خوخ ناضج، عسل زهر البرتقال، وفراولة برية.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    1,
    true,
    true
),
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '33333333-3333-3333-3333-333333333333',
    'Slow Cold Drip (16-Hour)',
    'كولد دريب البطيء (١٦ ساعة)',
    'Kyoto-style ice drip tower extraction. Silky wine-like mouthfeel with hints of dark cocoa and black cherry.',
    'استخلاص ببرج التقطير البطيء على الطريقة اليابانية. قوام حريري كثيف بنكهات الكرز الأسود والكاكاو.',
    'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    1,
    true,
    true
),
(
    '10101010-1010-1010-1010-101010101010',
    '33333333-3333-3333-3333-333333333333',
    '3+2 Spanish Latte',
    'سبانش لاتيه ٣+٢ المبتكر',
    'Specialty espresso infused with condensed dairy and organic cardamom extract over crystal clear block ice.',
    'إسبريسو مختص مع حليب مكثف محلى وخلاصة الهيل الطبيعي فوق قوالب ثلج نقية.',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    2,
    true,
    true
),
(
    '20202020-2020-2020-2020-202020202020',
    '44444444-4444-4444-4444-444444444444',
    'San Sebastián Burnt Cheesecake',
    'تشيز كيك سان سيباستيان المكرمل',
    'Creamy molten center with a caramelized crust. Served with warm single-origin chocolate ganache.',
    'قوام كريمي ذائب مع سطح مكرمل ذهبي، يُقدم مع صوص شوكولاتة أحادية المصدر الدافئة.',
    'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    1,
    true,
    true
)
on conflict (id) do nothing;

-- 3. Insert Product Sizes & Prices
insert into public.product_sizes (product_id, label_en, label_ar, price, display_order, is_available)
values
-- Espresso
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Double Shot (36g out)', 'جرعة مزدوجة (٣٦ مل)', 16.00, 1, true),
-- Cortado
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4.5 oz Glass', 'كوب زجاجي (١٣٥ مل)', 19.00, 1, true),
-- Flat White
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Standard (6 oz)', 'حجم قياسي (١٨٠ مل)', 21.00, 1, true),
-- Latte (Multi-size)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Regular (8 oz)', 'عادي (٢٤٠ مل)', 22.00, 1, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Large (12 oz)', 'كبير (٣٥٠ مل)', 26.00, 2, true),
-- V60 (Hot / Ice)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hot Brew (250ml Server)', 'مقطرة حارة (٢٥٠ مل)', 28.00, 1, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Iced Chemex Pour', 'مقطرة مثلجة على السيرفر', 30.00, 2, true),
-- Cold Drip
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Chilled Flask (200ml)', 'قارورة مبردة (٢٠٠ مل)', 27.00, 1, true),
-- Spanish Latte (Multi-size)
('10101010-1010-1010-1010-101010101010', 'Regular (10 oz)', 'وسط (٣٠٠ مل)', 24.00, 1, true),
('10101010-1010-1010-1010-101010101010', 'Large (14 oz)', 'كبير (٤٢٠ مل)', 28.00, 2, true),
-- Cheesecake
('20202020-2020-2020-2020-202020202020', 'Slice', 'شريحة', 26.00, 1, true);

-- 4. Insert Independent Extras
insert into public.extras (name_en, name_ar, price, is_available, display_order)
values
('Extra Double Shot (Single Origin)', 'جرعة إسبريسو مزدوجة إضافية (أحادي المصدر)', 6.00, true, 1),
('Organic Oat Milk (Oatly Barista)', 'حليب شوفان عضوي (أوتلي باريستا)', 4.50, true, 2),
('Artisan Almond Milk', 'حليب لوز محضر طازجاً', 4.50, true, 3),
('Madagascar Pure Vanilla Syrup', 'سيروب فانيليا مدغشقر الطبيعي', 3.50, true, 4),
('Salted Caramel Drizzle', 'كراميل مملح حرفي', 3.50, true, 5);

-- 5. Insert Site Settings
insert into public.site_settings (key, value_en, value_ar)
values
('currency', 'SAR', 'ر.س'),
('brand_story', '3 Sisters, 2 Brothers', '٣ أخوات، أخوان اثنان'),
('brand_tagline', 'One Perfect Cup', 'كوب واحد متقن')
on conflict (key) do nothing;
