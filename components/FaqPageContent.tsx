'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function FaqPageContent() {
  const { t } = useLanguage()
  const f = t.faqPage as Record<string, string>
  const h = t.header as Record<string, string>
  const foot = t.footer as Record<string, string>

  return (
    <main className="faq-page">
      <div className="faq-page-inner">
        <h1 className="faq-page-title">{f.title}</h1>
        <p className="faq-page-lead">{f.lead}</p>

        <section className="faq-section" aria-labelledby="faq-how">
          <h2 id="faq-how">{f.howTitle}</h2>
          <dl className="faq-list">
            <dt>{f.howQ1}</dt>
            <dd>
              {f.howA1Before}
              <Link href="/image-compare">{h.navFindByImage}</Link>
              {f.howA1After}
            </dd>
            <dt>{f.howQ2}</dt>
            <dd>{f.howA2}</dd>
            <dt>{f.howQ3}</dt>
            <dd>{f.howA3}</dd>
            <dt>{f.howQ4}</dt>
            <dd>{f.howA4}</dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-privacy">
          <h2 id="faq-privacy">{f.privacyTitle}</h2>
          <dl className="faq-list">
            <dt>{f.privQ1}</dt>
            <dd>{f.privA1}</dd>
            <dt>{f.privQ2}</dt>
            <dd>{f.privA2}</dd>
            <dt>{f.privQ3}</dt>
            <dd>
              {f.privA3Before}
              <Link href="/privacy">{foot.privacy}</Link>
              {f.privA3After}
            </dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-results">
          <h2 id="faq-results">{f.resultsTitle}</h2>
          <dl className="faq-list">
            <dt>{f.resQ1}</dt>
            <dd>
              {f.resA1Before}
              <Link href="/my/results">{h.navMyResults}</Link>
              {f.resA1After}
            </dd>
            <dt>{f.resQ2}</dt>
            <dd>
              {f.resA2Before}
              <Link href="/ranking">{t.ranking.title}</Link>
              {f.resA2After}
            </dd>
            <dt>{f.resQ3}</dt>
            <dd>
              {f.resA3Before}
              <Link href="/pokedex">{h.navPokedex}</Link>
              {f.resA3After}
            </dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-ai">
          <h2 id="faq-ai">{f.aiTitle}</h2>
          <p className="faq-section-p">{f.aiP1}</p>
          <p className="faq-section-p">{f.aiP2}</p>
        </section>

        <section className="faq-section" aria-labelledby="faq-mbti">
          <h2 id="faq-mbti">{f.mbtiTitle}</h2>
          <dl className="faq-list">
            <dt>{f.mbtiQ1}</dt>
            <dd>{f.mbtiA1}</dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-etc">
          <h2 id="faq-etc">{f.etcTitle}</h2>
          <dl className="faq-list">
            <dt>{f.etcQ1}</dt>
            <dd>{f.etcA1}</dd>
            <dt>{f.etcQ2}</dt>
            <dd>{f.etcA2}</dd>
          </dl>
        </section>
      </div>
    </main>
  )
}
