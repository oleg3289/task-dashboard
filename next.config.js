/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Remove API routes for static export
  experimental: {
    serverComponentsExternalPackages: ['ws']
  }
}

export default nextConfig