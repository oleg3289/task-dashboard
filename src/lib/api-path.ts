/**
 * Base path utility for GitHub Pages deployment
 * All API calls must use this to correctly resolve paths
 */

// Cached basePath detection
let cachedBasePath: string | null = null

/**
 * Get the base path for API calls
 * Returns '/task-dashboard' for production (GitHub Pages)
 * Returns '' for local development
 */
export function getBasePath(): string {
  if (cachedBasePath !== null) {
    return cachedBasePath
  }

  if (typeof window !== 'undefined') {
    // Check if we're on GitHub Pages by examining the current URL
    // GitHub Pages serves from /<repo-name>/, local dev serves from /
    const pathname = window.location.pathname
    
    // If the URL contains /task-dashboard in the path, we're on GitHub Pages
    if (pathname.startsWith('/task-dashboard')) {
      cachedBasePath = '/task-dashboard'
      return cachedBasePath
    }
    
    // Also check NEXT_PUBLIC_BASE_PATH env var if set
    const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH
    if (envBasePath) {
      cachedBasePath = envBasePath
      return cachedBasePath
    }
  }
  
  cachedBasePath = ''
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