/**
 * Centralized API Configuration for ATAL Store
 * Handles API Base URL resolution across Local Dev (Node/Vite), Node Production,
 * and Cloudflare Pages deployments.
 */

// Resolves API Base URL from VITE_API_URL environment variable if defined,
// or defaults to empty string for relative paths (e.g., /api/admin/login).
const rawBaseUrl = import.meta.env.VITE_API_URL || '';

// Clean base URL trailing slash if present
export const API_BASE_URL = rawBaseUrl.endsWith('/') 
  ? rawBaseUrl.slice(0, -1) 
  : rawBaseUrl;

/**
 * Returns full API endpoint URL for any given path.
 * Example: getApiUrl('/api/admin/login') => 'https://api.atal.pk/api/admin/login' or '/api/admin/login'
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export const API_TIMEOUT_MS = 10000; // 10 seconds network timeout
