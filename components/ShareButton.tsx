'use client'

import { useState } from 'react'
import {
  generateShareImage,
  downloadImage,
  copyImageToClipboard,
  shareViaWebShare,
  copyLinkToClipboard,
} from '../utils/shareImage'
import { useLanguage } from '../contexts/LanguageContext'

interface ShareButtonProps {
  userImageUrl: string
  pokemon: {
    id: number
    name: string
    imageUrl: string
    similarity: number
    type?: string
  }
}

export default function ShareButton({ userImageUrl, pokemon }: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const { t } = useLanguage()

  const handleShare = async (method: 'download' | 'copy' | 'share' | 'link') => {
    setIsGenerating(true)
    setShareMenuOpen(false)

    try {
      const shareImageUrl = await generateShareImage({
        userImageUrl,
        pokemonImageUrl: pokemon.imageUrl,
        pokemonName: pokemon.name,
        similarity: pokemon.similarity,
        pokemonType: pokemon.type,
      })

      switch (method) {
        case 'download':
          downloadImage(shareImageUrl, `pokemon-lookalike-${pokemon.name}.png`)
          break
        case 'copy':
          const copied = await copyImageToClipboard(shareImageUrl)
          if (copied) {
            alert(t.share.imageCopied || '이미지가 클립보드에 복사되었습니다!')
          } else {
            alert(t.share.copyFailed || '이미지 복사에 실패했습니다.')
          }
          break
        case 'share':
          const shared = await shareViaWebShare(
            t.share.shareTitle || `나와 닮은 포켓몬: ${pokemon.name}`,
            t.share.shareText || `유사도 ${(pokemon.similarity * 100).toFixed(1)}%`,
            window.location.href,
            shareImageUrl
          )
          if (!shared) {
            // Web Share API를 지원하지 않는 경우 다운로드로 대체
            downloadImage(shareImageUrl, `pokemon-lookalike-${pokemon.name}.png`)
          }
          break
        case 'link':
          const linkCopied = await copyLinkToClipboard(window.location.href)
          if (linkCopied) {
            alert(t.share.linkCopied || '링크가 클립보드에 복사되었습니다!')
          } else {
            alert(t.share.copyFailed || '링크 복사에 실패했습니다.')
          }
          break
      }
    } catch (error) {
      console.error('공유 이미지 생성 실패:', error)
      alert(t.share.error || '이미지 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="share-button-container">
      <button
        type="button"
        onClick={() => setShareMenuOpen(!shareMenuOpen)}
        disabled={isGenerating}
        className="share-button"
      >
        {isGenerating ? t.share.generating || '생성 중...' : t.share.share || '공유하기'}
      </button>

      {shareMenuOpen && (
        <div className="share-menu">
          <button type="button" onClick={() => handleShare('download')} className="share-menu-item">
            📥 {t.share.download || '이미지 다운로드'}
          </button>
          <button type="button" onClick={() => handleShare('copy')} className="share-menu-item">
            📋 {t.share.copyImage || '이미지 복사'}
          </button>
          <button type="button" onClick={() => handleShare('share')} className="share-menu-item">
            📤 {t.share.shareVia || '공유하기'}
          </button>
          <button type="button" onClick={() => handleShare('link')} className="share-menu-item">
            🔗 {t.share.copyLink || '링크 복사'}
          </button>
        </div>
      )}
    </div>
  )
}
