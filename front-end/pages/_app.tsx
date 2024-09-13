// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Navbar from '@/components/navbar'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AuthenticatedApp Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}

type AuthenticatedAppProps = {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
}

function AuthenticatedApp({ Component, pageProps }: AuthenticatedAppProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      const publicPaths: string[] = ['/', '/login', '/signup']
      const path: string = router.pathname

      if (!user && !publicPaths.includes(path)) {
        router.push('/login')
      } else if (user && publicPaths.includes(path)) {
        router.push('/dashboard')
      }
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp