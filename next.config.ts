import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow any HTTPS image for flexibility
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
