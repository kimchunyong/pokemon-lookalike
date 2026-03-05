/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},
  serverExternalPackages: [
    '@tensorflow/tfjs',
    '@vladmandic/face-api',
    '@huggingface/transformers',
    'onnxruntime-node',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
    unoptimized: true,
  },
}

export default nextConfig
