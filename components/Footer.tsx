import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      style={{
        padding: '1.5rem 1rem',
        marginTop: '3rem',
        textAlign: 'center',
        fontSize: 14,
        color: '#888',
      }}
    >
      <nav
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <Link href="/terms" style={{ color: '#666', textDecoration: 'none' }}>
          이용약관
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>
          개인정보처리방침
        </Link>
        <span style={{ color: '#ddd' }}>|</span>
        <Link href="/contact" style={{ color: '#666', textDecoration: 'none' }}>
          문의하기
        </Link>
      </nav>
      <p>&copy; {new Date().getFullYear()} Pocketmon Face. All rights reserved.</p>
    </footer>
  )
}
