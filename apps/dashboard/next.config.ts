import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@google/generative-ai']
}

export default nextConfig
