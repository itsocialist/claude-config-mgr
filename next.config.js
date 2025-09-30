/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  images: {
    unoptimized: process.env.NEXT_OUTPUT === 'export',
  },
  // Disable static optimization for Electron to use API routes
  ...(process.env.NODE_ENV === 'production' && process.env.NEXT_OUTPUT !== 'export' && {
    output: 'standalone',
  }),
}

module.exports = nextConfig