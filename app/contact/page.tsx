import Link from 'next/link'

export const metadata = {
  title: '문의하기',
  description: 'Pocketmon Face 문의',
}

export default function ContactPage() {
  return (
    <div
      style={{
        padding: '1.5rem',
        maxWidth: 720,
        margin: '0 auto',
        minHeight: 'calc(100vh - 201px)',
      }}
    >
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>문의하기</h1>
      <p style={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
        Pocketmon Face 서비스에 대한 문의가 있으시면 아래 이메일로 연락해 주세요.
      </p>
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)' }}>
          <strong>이메일</strong>:{' '}
          <a href="mailto:lovemy5853@gmail.com" style={{ color: '#1976d2' }}>
            lovemy5853@gmail.com
          </a>
        </p>
        <p style={{ margin: '0.5rem 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
          운영 시간 내 순차적으로 답변드리겠습니다.
        </p>
      </div>
      <p style={{ fontSize: 14 }}>
        <Link href="/" style={{ color: '#1976d2' }}>
          ← 홈
        </Link>
      </p>
    </div>
  )
}
