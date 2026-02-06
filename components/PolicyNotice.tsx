'use client'

import { useLanguage } from '../contexts/LanguageContext'

export default function PolicyNotice() {
  const { t } = useLanguage()

  return (
    <div className="policy-notice">
      <h3>{t.policy.title}</h3>
      <ul>
        <li>
          <strong>{t.policy.entertainment.label}</strong> {t.policy.entertainment.text}
        </li>
        <li>
          <strong>{t.policy.privacy.label}</strong> {t.policy.privacy.text}
        </li>
        <li>
          <strong>{t.policy.copyright.label}</strong> {t.policy.copyright.text}
        </li>
        <li>
          <strong>{t.policy.disclaimer.label}</strong> {t.policy.disclaimer.text}
        </li>
      </ul>
    </div>
  )
}
