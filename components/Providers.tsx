'use client'

import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import AuthHeader from './AuthHeader'
import Footer from './Footer'
import GoogleAnalytics from './GoogleAnalytics'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <GoogleAnalytics />
        <AuthHeader />
        {children}
        <Footer />
      </AuthProvider>
    </LanguageProvider>
  )
}
