'use client'

import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import AuthHeader from './AuthHeader'
import Footer from './Footer'
import GoogleAnalytics from './GoogleAnalytics'
import CompareDataClearer from './CompareDataClearer'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <CompareDataClearer />
        </Suspense>
        <AuthHeader />
        {children}
        <Footer />
      </AuthProvider>
    </LanguageProvider>
  )
}
