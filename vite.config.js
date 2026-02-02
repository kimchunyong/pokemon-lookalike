import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // 포트가 사용 중이면 다른 포트 자동 선택
    host: true, // 네트워크 접근 허용
  },
})
