/**
 * auth.js — Admin authentication, Origin validation, and CSRF protection.
 *
 * Rules:
 *  1. Restricts write operations strictly to local admin requests (127.0.0.1 / localhost).
 *  2. Enforces X-Admin-Token header matching process.env.ADMIN_TOKEN.
 *  3. Validates Origin/Referer against allowed local origins for CSRF defense.
 *  4. Health check GET /api/health is open for local monitoring.
 */

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

export function auth(req, res, next) {
  // 1. Allow health check
  if (req.method === 'GET' && (req.path === '/health' || req.path === '/api/health')) {
    return next();
  }

  // 2. Validate Origin / Referer for CSRF prevention on mutating requests
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (isMutating) {
    const origin = req.headers['origin'];
    const referer = req.headers['referer'];

    if (origin && !ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))) {
      console.warn(`[${new Date().toISOString()}] CSRF blocked: forbidden Origin "${origin}"`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Cross-origin request rejected. Admin write operations are restricted to 127.0.0.1.',
      });
    }

    if (!origin && referer && !ALLOWED_ORIGINS.some((allowed) => referer.startsWith(allowed))) {
      console.warn(`[${new Date().toISOString()}] CSRF blocked: forbidden Referer "${referer}"`);
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Untrusted referer rejected.',
      });
    }
  }

  // 3. Verify Admin Token
  const token = req.headers['x-admin-token'];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing X-Admin-Token header. Admin operations require local token authentication.',
    });
  }

  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    console.warn(`[${new Date().toISOString()}] WARNING: ADMIN_TOKEN env var is not set in admin-server/.env!`);
    return res.status(500).json({
      success: false,
      error: 'Server error: ADMIN_TOKEN is not configured in local admin-server/.env',
    });
  }

  if (token !== expectedToken) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid admin token.',
    });
  }

  next();
}
