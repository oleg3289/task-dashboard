/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment - serve from root, no basePath
  // The app will be accessible at https://<user>.github.io/ (or custom domain)
  // Remove basePath to avoid _next/static/404 errors
  // basePath: '/task-dashboard',  // COMMENTED - causes asset path mismatches on GitHub Pages
  
  // Remove API routes for static export
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
}

export default nextConfig
