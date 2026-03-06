/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment - app is served from /task-dashboard/
  basePath: '/task-dashboard',
  
  // Remove API routes for static export
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
}

export default nextConfig
