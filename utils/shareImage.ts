/**
 * 공유용 이미지 생성 유틸리티
 */

interface ShareImageOptions {
  userImageUrl: string
  pokemonImageUrl: string
  pokemonName: string
  similarity: number
  pokemonType?: string
}

/**
 * Canvas를 사용하여 공유용 이미지 생성
 */
export async function generateShareImage(options: ShareImageOptions): Promise<string> {
  const { userImageUrl, pokemonImageUrl, pokemonName, similarity, pokemonType } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context를 가져올 수 없습니다.'))
      return
    }

    // Canvas 크기 설정 (1200x630 - SNS 공유 최적 크기)
    canvas.width = 1200
    canvas.height = 630

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(1, '#16213e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 이미지 로드
    const userImg = new Image()
    const pokemonImg = new Image()
    
    userImg.crossOrigin = 'anonymous'
    pokemonImg.crossOrigin = 'anonymous'

    let userImgLoaded = false
    let pokemonImgLoaded = false

    const checkAndDraw = () => {
      if (!userImgLoaded || !pokemonImgLoaded) return

      try {
        // 사용자 이미지 그리기 (왼쪽)
        const userImgSize = 280
        const userX = 100
        const userY = (canvas.height - userImgSize) / 2
        
        // 원형 마스크를 위한 클리핑
        ctx.save()
        ctx.beginPath()
        ctx.arc(userX + userImgSize / 2, userY + userImgSize / 2, userImgSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(userImg, userX, userY, userImgSize, userImgSize)
        ctx.restore()

        // VS 텍스트
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('VS', canvas.width / 2, canvas.height / 2 + 20)

        // 포켓몬 이미지 그리기 (오른쪽)
        const pokemonImgSize = 300
        const pokemonX = canvas.width - pokemonImgSize - 100
        const pokemonY = (canvas.height - pokemonImgSize) / 2
        
        ctx.drawImage(pokemonImg, pokemonX, pokemonY, pokemonImgSize, pokemonImgSize)

        // 포켓몬 이름
        ctx.fillStyle = '#646cff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(pokemonName, canvas.width / 2, 100)

        // 유사도 표시
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 72px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${(similarity * 100).toFixed(1)}%`, canvas.width / 2, canvas.height - 80)

        // 타입 표시 (있는 경우)
        if (pokemonType) {
          ctx.fillStyle = '#888'
          ctx.font = '36px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(pokemonType, canvas.width / 2, canvas.height - 30)
        }

        // 워터마크
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.font = '24px Arial'
        ctx.textAlign = 'right'
        ctx.fillText('pokemon-lookalike.com', canvas.width - 20, canvas.height - 20)

        // Canvas를 이미지로 변환
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch (error) {
        reject(error)
      }
    }

    userImg.onload = () => {
      userImgLoaded = true
      checkAndDraw()
    }

    pokemonImg.onload = () => {
      pokemonImgLoaded = true
      checkAndDraw()
    }

    userImg.onerror = () => reject(new Error('사용자 이미지를 로드할 수 없습니다.'))
    pokemonImg.onerror = () => reject(new Error('포켓몬 이미지를 로드할 수 없습니다.'))

    userImg.src = userImageUrl
    pokemonImg.src = pokemonImageUrl
  })
}

/**
 * 이미지를 다운로드
 */
export function downloadImage(dataUrl: string, filename: string = 'pokemon-lookalike.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 클립보드에 이미지 복사
 */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    return true
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    return false
  }
}

/**
 * Web Share API를 사용한 공유
 */
export async function shareViaWebShare(title: string, text: string, url: string, imageUrl?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      const shareData: ShareData = {
        title,
        text,
        url,
      }
      
      // files 속성은 일부 브라우저에서만 지원되므로 선택적으로 사용
      if (imageUrl && 'canShare' in navigator && navigator.canShare) {
        try {
          const blob = await fetch(imageUrl).then(r => r.blob())
          const file = new File([blob], 'pokemon-lookalike.png', { type: 'image/png' })
          const shareDataWithFile: ShareData = {
            ...shareData,
            files: [file],
          }
          
          if (navigator.canShare(shareDataWithFile)) {
            await navigator.share(shareDataWithFile)
            return true
          }
        } catch (fileError) {
          // files를 지원하지 않는 경우 URL만 공유
          console.log('Files sharing not supported, sharing URL only')
        }
      }
      
      // files를 지원하지 않거나 제공되지 않은 경우 URL만 공유
      await navigator.share(shareData)
      return true
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('공유 실패:', error)
      }
      return false
    }
  }
  return false
}

/**
 * 링크 복사
 */
export async function copyLinkToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('링크 복사 실패:', error)
    return false
  }
}
