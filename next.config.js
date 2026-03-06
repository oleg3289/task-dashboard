/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment - app is served from /task-dashboard/
  // Only set basePath when building for GitHub Pages (GITHUB_PAGES=true)
  // Local development runs at root /
  basePath: isGitHubPages ? '/task-dashboard' : '',
  
  // Remove API routes for static export
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
}

export default nextConfig