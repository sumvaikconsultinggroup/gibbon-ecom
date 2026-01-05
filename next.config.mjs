/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for faster dev experience
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  
  // Experimental features for faster compilation
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Increase body size limit for video uploads (100MB)
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  
  allowedDevOrigins: [
    'gibbon-dashboard.preview.emergentagent.com',
    'reviewhub-29.preview.emergentagent.com',
    'a2c497b9-6c94-4871-92dd-983833deba17.preview.emergentagent.com',
    '*.preview.emergentagent.com',
  ],
  images: {
    minimumCacheTTL: 2678400 * 12, // 6 months
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
            {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
