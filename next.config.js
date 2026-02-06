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
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 서버 사이드에서는 TensorFlow.js를 제외
      config.externals = config.externals || []
      config.externals.push('@tensorflow/tfjs')
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
  },
}

export default nextConfig
