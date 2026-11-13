/**
 * adminApi.ts — HTTP client for the dedicated local Windows administration server.
 *
 * Security & Architecture Rules:
 *  1. Base URL is strictly http://127.0.0.1:3001/api.
 *  2. No tokens or secrets are hardcoded in source code or Vite environment variables.
 *  3. Admin token is read dynamically from browser sessionStorage.
 *  4. On the public static deployment, calls are prevented from attempting to contact localhost.
 */

import type {
  Category,
  CategoryFormData,
  Product,
  ProductFormData,
  Extra,
  ExtraFormData,
  BackupInfo,
  GitStatus,
  GitResult,
  HealthStatus,
  AdminApiResponse,
} from '@/types';
import { isLocalAdminEnvironment } from '@/hooks/useAuth';

// In local browser environment, prefer relative /api (handled by Vite proxy on 5173 or directly on 3001)
const BASE_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api'
    : 'http://127.0.0.1:3001/api';
const TOKEN_KEY = '3plus2_admin_session_token';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAdminToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!isLocalAdminEnvironment()) {
    throw new Error('Administration operations are restricted to the local café workstation (127.0.0.1).');
  }

  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('X-Admin-Token', token);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = (await response.json()) as AdminApiResponse<T>;

  if (!response.ok || !json.success) {
    const errorMsg = json.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health', { method: 'GET' });
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function getAdminCategories(): Promise<Category[]> {
  return request<Category[]>('/categories', { method: 'GET' });
}

export async function createCategory(data: Partial<CategoryFormData>): Promise<Category> {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
  return request<Category>(`/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<{ deleted: string }> {
  return request<{ deleted: string }>(`/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ── Products ─────────────────────────────────────────────────────────────────
export async function getAdminProducts(): Promise<Product[]> {
  return request<Product[]>('/products', { method: 'GET' });
}

export async function getAdminProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function createProduct(data: Partial<ProductFormData>): Promise<Product> {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleProductAvailability(id: string, is_visible?: boolean): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ is_visible }),
  });
}

export async function deleteProduct(id: string): Promise<{ deleted: string }> {
  return request<{ deleted: string }>(`/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ── Extras ───────────────────────────────────────────────────────────────────
export async function getAdminExtras(): Promise<Extra[]> {
  return request<Extra[]>('/extras', { method: 'GET' });
}

export async function createExtra(data: Partial<ExtraFormData>): Promise<Extra> {
  return request<Extra>('/extras', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExtra(id: string, data: Partial<ExtraFormData>): Promise<Extra> {
  return request<Extra>(`/extras/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteExtra(id: string): Promise<{ deleted: string }> {
  return request<{ deleted: string }>(`/extras/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ── Image Management ─────────────────────────────────────────────────────────
export async function uploadImage(file: File): Promise<{ filename: string; publicPath: string; size: number }> {
  const formData = new FormData();
  formData.append('image', file);

  return request<{ filename: string; publicPath: string; size: number }>('/images/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteImage(filename: string): Promise<{ deleted: string }> {
  return request<{ deleted: string }>(`/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
}

// ── Backup & Restore ─────────────────────────────────────────────────────────
export async function listBackups(): Promise<BackupInfo[]> {
  return request<BackupInfo[]>('/backups', { method: 'GET' });
}

export async function createBackup(label?: string): Promise<{ backupId: string; label: string }> {
  return request<{ backupId: string; label: string }>('/backups', {
    method: 'POST',
    body: JSON.stringify({ label }),
  });
}

export async function restoreBackup(backupId: string): Promise<{
  restoredFrom: string;
  safetyBackupId: string;
  message: string;
}> {
  return request<{
    restoredFrom: string;
    safetyBackupId: string;
    message: string;
  }>(`/backups/${encodeURIComponent(backupId)}/restore`, {
    method: 'POST',
    body: JSON.stringify({ confirmed: true }),
  });
}

export async function restoreProduct(
  backupId: string,
  productId: string
): Promise<{ product: Product; safetyBackupId: string }> {
  return request<{ product: Product; safetyBackupId: string }>(
    `/backups/${encodeURIComponent(backupId)}/restore-product/${encodeURIComponent(productId)}`,
    {
      method: 'POST',
      body: JSON.stringify({ confirmed: true }),
    }
  );
}

// ── Git & Publishing ─────────────────────────────────────────────────────────
export async function getGitStatus(): Promise<GitStatus> {
  return request<GitStatus>('/git/status', { method: 'GET' });
}

export async function commitAndPush(
  message: string,
  operation = 'admin-update'
): Promise<GitResult & { savedLocally: boolean; backupId?: string }> {
  return request<GitResult & { savedLocally: boolean; backupId?: string }>('/git/commit-and-push', {
    method: 'POST',
    body: JSON.stringify({ message, operation }),
  });
}

