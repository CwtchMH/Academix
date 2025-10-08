'use client'

import { useEffect, ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import { getAccessToken } from '@/services/utils/auth.utils'
import { useAuthHook } from '@/hooks/useAuthHook'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const { getUser, user, clearUser } = useAuth()
  const initialized = useRef(false)

  useAuthHook()

  // Effect 1: Initialize - chỉ chạy 1 lần duy nhất
  useEffect(() => {
    if (initialized.current) return

    const initializeAuth = async () => {
      try {
        const token = getAccessToken()

        if (token && !user) {
          console.log('[AuthProvider] Initialize: Fetching user...')
          initialized.current = true
          await getUser()
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to initialize auth:', error)
        clearUser()
        initialized.current = false
      }
    }

    initializeAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Effect 2: Refetch khi pathname thay đổi
  useEffect(() => {
    // Skip lần đầu (đã fetch ở effect 1)
    if (!initialized.current) return

    const refetchUser = async () => {
      try {
        const token = getAccessToken()

        if (token && user) {
          console.log('[AuthProvider] Pathname changed: Refetching user...')
          await getUser()
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to refetch user:', error)
      }
    }

    refetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return <>{children}</>
}
