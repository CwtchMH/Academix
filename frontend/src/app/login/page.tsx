'use client'

import { useState } from 'react'
import { LoginCard } from '@/components/organisms'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (data: any) => {
    console.log('Login data:', data)
    setLoading(true)
    setError('')

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success/error
      if (data.email === 'admin@test.com' && data.password === 'password') {
        console.log('Login successful!')
        // TODO: Redirect to dashboard
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoginCard onSubmit={handleLogin} loading={loading} error={error} />

      {/* Copyright */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          © 2024 University Name. All rights reserved.
        </p>
      </div>
    </>
  )
}
