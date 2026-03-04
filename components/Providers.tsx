'use client'

import type { ReactNode } from 'react'
import { LanguageProvider } from '../contexts/LanguageContext'
import { AuthProvider } from '../contexts/AuthContext'
import AuthHeader from './AuthHeader'
import Footer from './Footer'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AuthHeader />
        {children}
        <Footer />
      </AuthProvider>
    </LanguageProvider>
  )
}
