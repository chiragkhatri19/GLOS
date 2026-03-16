import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@google/generative-ai', 'lingo.dev', '@anthropic-ai/sdk'],
  
  // Disable CSP in development to avoid Turbopack warnings
  // This only affects dev mode, production remains secure
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;" 
              : "default-src 'self';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
