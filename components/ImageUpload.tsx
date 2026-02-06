'use client'

import { useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface ImageUploadProps {
  onImageSelect?: (imageUrl: string | null) => void
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setError(t.imageCompare.onlyImages)
      return
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t.imageCompare.fileSizeError)
      return
    }

    setError(null)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onImageSelect?.(result)
    }
    reader.onerror = () => {
      setError(t.imageCompare.imageReadError)
    }
    reader.readAsDataURL(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleReset = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageSelect?.(null)
  }

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {!preview ? (
        <div className="upload-area" onClick={handleClick}>
          <p>{t.imageCompare.uploadPlaceholder}</p>
          <p style={{ fontSize: '0.8em', color: '#888', marginTop: '0.5rem' }}>
            {t.imageCompare.privacyNotice}
          </p>
          <button type="button">{t.imageCompare.selectImage}</button>
        </div>
      ) : (
        <div className="preview-area">
          <img src={preview} alt="업로드된 이미지" />
          <div className="preview-actions">
            <button type="button" onClick={handleClick}>
              {t.imageCompare.changeImage}
            </button>
            <button type="button" onClick={handleReset}>
              {t.imageCompare.reset}
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}
