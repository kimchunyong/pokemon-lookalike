'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function CommonLoadingFallback() {
  const { t } = useLanguage()
  return (
    <div style={{ padding: '2rem', textAlign: 'center', marginTop: '90px' }}>
      {t.common.loadingShort}
    </div>
  )
}
