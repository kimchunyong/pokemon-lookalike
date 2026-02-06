// 빌드 후 out 폴더를 dist 폴더로 이동
import { rmSync, renameSync, existsSync } from 'fs'
import { join } from 'path'

const outDir = join(process.cwd(), 'out')
const distDir = join(process.cwd(), 'dist')

try {
  // 기존 dist 폴더가 있으면 삭제
  if (existsSync(distDir)) {
    console.log('기존 dist 폴더 삭제 중...')
    rmSync(distDir, { recursive: true, force: true })
  }

  // out 폴더가 있으면 dist로 이름 변경
  if (existsSync(outDir)) {
    console.log('out 폴더를 dist 폴더로 이동 중...')
    renameSync(outDir, distDir)
    console.log('✅ 빌드 파일이 dist 폴더에 생성되었습니다!')
  } else {
    console.warn('⚠️ out 폴더를 찾을 수 없습니다. 빌드가 실패했을 수 있습니다.')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ 오류 발생:', error.message)
  process.exit(1)
}
