/**
 * Base path utility for GitHub Pages deployment
 * All API calls must use this to correctly resolve paths
 */

/**
 * Get the base path for API calls
 * Returns '/task-dashboard' for production (GitHub Pages)
 * Returns '' for local development
 */
export function getBasePath(): string {
  // In browser, check if we're on GitHub Pages
  if (typeof window !== 'undefined') {
    // If the app is served from a subpath, use that
    const pathPrefix = process.env.NEXT_PUBLIC_BASE_PATH || ''
    return pathPrefix
  }
  return ''
}

/**
 * Prepend base path to an API route
 * @param path - Path starting with '/', e.g. '/data/agents.json'
 * @returns Full path with basePath, e.g. '/task-dashboard/data/agents.json'
 */
export function apiPath(path: string): string {
  const base = getBasePath()
  if (!base) return path
  // Ensure no double slashes
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

/**
 * Fetch with base path applied
 * @param path - Path starting with '/', e.g. '/data/agents.json'
 * @param init - Fetch options
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiPath(path), init)
}