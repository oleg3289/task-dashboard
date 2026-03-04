/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages deployment base path
  basePath: '/task-dashboard',
  // Remove API routes for static export
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
}

export default nextConfig