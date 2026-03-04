/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static Export 활성화 (dist 폴더에 출력하기 위해)
  output: 'export',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // src 폴더 제외
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  excludeDefaultMomentLocales: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // TensorFlow.js는 클라이언트 사이드에서만 작동
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@tensorflow/tfjs', '@vladmandic/face-api']
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs-node': false,
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        encoding: false,
      }
    }

    // dev 모드에서 chunk ID를 경로 기반으로 고정하여 HMR 캐시 불일치 방지
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      }
    }

    return config
  },
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
    unoptimized: true, // Static Export에서는 이미지 최적화 기능 제한됨
  },
}

export default nextConfig
