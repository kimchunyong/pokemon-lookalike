import { useRef, useState } from 'react'

function ImageUpload({ onImageSelect }) {
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    setError(null)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageSelect?.(e.target.result)
    }
    reader.onerror = () => {
      setError('이미지 읽기 중 오류가 발생했습니다.')
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
          <p>이미지를 클릭하거나 드래그하여 업로드</p>
          <button type="button">이미지 선택</button>
        </div>
      ) : (
        <div className="preview-area">
          <img src={preview} alt="업로드된 이미지" />
          <div className="preview-actions">
            <button type="button" onClick={handleClick}>
              다른 이미지 선택
            </button>
            <button type="button" onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  )
}

export default ImageUpload
