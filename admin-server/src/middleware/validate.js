/**
 * validate.js — Request validation middleware and sanitization helpers
 */

/**
 * Ensure an id string is safe (alphanumeric, hyphens, underscores only).
 * Prevents path traversal and injection attacks.
 * @param {string} str
 * @returns {boolean}
 */
export function sanitizeId(str) {
  if (typeof str !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(str);
}

/**
 * Sanitize filename to prevent directory traversal.
 * Only allows basename with safe extensions (.jpg, .jpeg, .png, .webp).
 * @param {string} filename
 * @returns {string|null}
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return null;
  const base = filename.replace(/^.*[\\/]/, '');
  if (!/^[a-zA-Z0-9_.-]+$/.test(base)) return null;
  const ext = base.split('.').pop()?.toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return null;
  return base;
}

/**
 * Validate product fields on POST/PUT.
 * Required: name_en or name_ar, category_id, sizes (non-empty array).
 */
export function validateProduct(req, res, next) {
  const { name_en, name_ar, name, category_id, sizes } = req.body;

  const hasName = (name_en && name_en.trim()) || (name_ar && name_ar.trim()) || (name && name.trim());
  if (!hasName) {
    return res.status(400).json({
      success: false,
      error: 'Product name is required (name_en or name_ar)',
    });
  }

  if (!category_id || typeof category_id !== 'string' || category_id.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Product category_id is required',
    });
  }

  const sizesArr = sizes || req.body.product_sizes;
  if (!Array.isArray(sizesArr) || sizesArr.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Product must have at least one size/price',
    });
  }

  for (let i = 0; i < sizesArr.length; i++) {
    const size = sizesArr[i];
    const hasLabel = (size.label_en && size.label_en.trim()) || (size.label_ar && size.label_ar.trim()) || (size.name && size.name.trim());
    if (!hasLabel) {
      return res.status(400).json({
        success: false,
        error: `Size[${i}] must have a label (label_en or label_ar)`,
      });
    }
    const price = typeof size.price === 'string' ? parseFloat(size.price) : size.price;
    if (typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        error: `Size[${i}].price must be a valid non-negative number`,
      });
    }
  }

  next();
}

/**
 * Validate category fields on POST/PUT.
 */
export function validateCategory(req, res, next) {
  const { name_en, name_ar, name } = req.body;
  const hasName = (name_en && name_en.trim()) || (name_ar && name_ar.trim()) || (name && name.trim());

  if (!hasName) {
    return res.status(400).json({
      success: false,
      error: 'Category name is required (name_en or name_ar)',
    });
  }

  next();
}

/**
 * Validate extra fields on POST/PUT.
 */
export function validateExtra(req, res, next) {
  const { name_en, name_ar, name, price } = req.body;
  const hasName = (name_en && name_en.trim()) || (name_ar && name_ar.trim()) || (name && name.trim());

  if (!hasName) {
    return res.status(400).json({
      success: false,
      error: 'Extra name is required (name_en or name_ar)',
    });
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (typeof numPrice !== 'number' || isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({
      success: false,
      error: 'Extra price must be a non-negative number',
    });
  }

  next();
}
