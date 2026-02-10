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
    // 서버 사이드 빌드 시
    if (isServer) {
      config.externals = [...(config.externals || []), '@tensorflow/tfjs', '@vladmandic/face-api'];
    }

    // 클라이언트 및 서버 공통 설정
    // face-api가 node 환경을 감지하고 tfjs-node를 불러오려는 것을 방지
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs-node': false,
    };

    // fs, path 등 Node.js 모듈을 브라우저에서 사용할 수 없으므로 빈 객체로 대체
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        encoding: false,
      };
    }

    return config;
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
