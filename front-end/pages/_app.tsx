// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async (): Promise<void> => {
      // Replace this with your actual authentication check
      const auth: boolean = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(auth)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const publicPaths: string[] = ['/', '/login', '/signup']
      const path: string = router.pathname

      if (!isAuthenticated && !publicPaths.includes(path)) {
        router.push('/login')
      } else if (isAuthenticated && publicPaths.includes(path)) {
        router.push('/homepage')
      }
    }
  }, [isLoading, isAuthenticated, router])

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