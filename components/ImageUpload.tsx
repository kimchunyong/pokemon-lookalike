'use client'

import { useRef, useState, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface ImageUploadProps {
  onImageSelect?: (imageUrl: string | null) => void
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const { t } = useLanguage()

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError(t.imageCompare.onlyImages)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(t.imageCompare.fileSizeError)
        return
      }
      setError(null)
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
    },
    [t, onImageSelect]
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

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
        <div
          className="upload-area"
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderColor: dragging ? '#646cff' : undefined,
            background: dragging ? 'rgba(100, 108, 255, 0.08)' : undefined,
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <p>{dragging ? '여기에 놓으세요!' : t.imageCompare.uploadPlaceholder}</p>
          <p style={{ fontSize: '0.8em', color: '#888', marginTop: '0.5rem' }}>
            {t.imageCompare.privacyNotice}
          </p>
          <button type="button">{t.imageCompare.selectImage}</button>
        </div>
      ) : (
        <div
          className="preview-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
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
