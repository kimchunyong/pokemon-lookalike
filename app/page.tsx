'use client'

import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { trackEvent } from '@/lib/ga'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <main className="home-page-wrapper">
      <div className="home-page-video-backdrop" aria-hidden>
        <video className="home-page-video" autoPlay loop muted playsInline preload="none">
          <source src="/video/pokemon_main_video.mp4" type="video/mp4" />
        </video>
        <div className="home-page-video-overlay" />
      </div>

      <div className="home-page">
        <section className="home-hero-content" aria-label="포켓몬 닮은꼴 테스트 시작">
          <h1>{t.home.title}</h1>
          <p>{t.home.subtitle}</p>
          <p style={{ fontSize: '0.9em', color: 'rgba(255,255,255,0.85)', marginTop: '0.5rem' }}>
            {t.home.disclaimer}
          </p>

          <div className="option-buttons">
            <Link
              href="/image-compare"
              onClick={() => {
                trackEvent({ label: 'Main Page Image Search Button' })
              }}
            >
              <button type="button" className="primary-button">
                {t.home.findByImage}
              </button>
            </Link>
          </div>
        </section>

        <section
          className="home-seo-content"
          aria-label="포켓몬 닮은꼴 테스트, 포켓몬 닮은꼴 찾기 소개"
          style={{
            padding: '1.5rem',
            maxWidth: 640,
            textAlign: 'left',
            fontSize: '0.95em',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'rgba(255,255,255,0.95)' }}>
            포켓몬 닮은꼴 테스트·포켓몬 닮은꼴 찾기란?
          </h2>
          <p>
            <strong>포켓몬 닮은꼴 테스트</strong>와 <strong>포켓몬 닮은꼴 찾기</strong>는 사진 한 장으로 <strong>나와 닮은 포켓몬</strong>을 AI가 찾아주는 서비스입니다.
            이미지를 업로드하면 1·2·3·4세대와 메가진화 포켓몬 중에서 얼굴 유사도가 높은 포켓몬을 순서대로 보여드립니다. 포켓몬 닮은꼴 찾기는 무료이며, 개인정보는 저장하지 않습니다.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <strong>포켓몬 닮은꼴 테스트</strong> 결과를 바탕으로 <strong>포켓몬 도감</strong>에서 해당 포켓몬의 타입·능력치·진화 정보를 확인할 수 있고,
            로그인 후 <strong>닮은꼴 랭킹</strong>에 등록하거나 커뮤니티에서 다른 유저와 포켓몬 닮은꼴 찾기 결과를 공유할 수 있습니다.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <strong style={{ color: 'rgba(255,255,255,0.95)' }}>감정에 따른 결과</strong>
            — 사진에서 감지된 표정(웃는 얼굴, 화남, 슬픔 등)에 따라 어울리는 포켓몬 타입에 가산이 적용되어,
            같은 사진이라도 표정에 따라 3위 이후 순위가 달라질 수 있어 더 다양한 포켓몬을 만나볼 수 있습니다.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <strong style={{ color: 'rgba(255,255,255,0.95)' }}>포켓몬 MBTI 유추</strong>
            — 결과 페이지에서 &quot;내 얼굴에서 이런 MBTI가 나온다고?&quot; 영역을 펼치면, 닮은 포켓몬과 감정 데이터를 바탕으로
            <strong> 16가지 MBTI 유형</strong> 중 하나를 재미로 유추해 드립니다. 성격 능력치(귀여움·공격력·친화력·지능·게으름) 오각형 차트와
            &quot;환상의 짝꿍&quot; 관상까지 확인할 수 있으며, 나와 잘 맞는 친구에게 카카오톡으로 공유할 수 있습니다. (참고용·성격 검사 아님)
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            모든 분석은 브라우저에서만 이루어지며, 업로드한 사진은 서버로 전송되거나 저장되지 않습니다.
            포켓몬 닮은꼴 테스트는 1·2·3·4세대 및 메가진화 포켓몬 약 200종 이상과 비교하여 가장 닮은 순서로 결과를 보여줍니다.
          </p>
        </section>
      </div>
    </main>
  )
}
