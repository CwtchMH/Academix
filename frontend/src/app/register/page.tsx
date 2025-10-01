'use client'

import { useState } from 'react'
import { RegisterCard } from '@/components/organisms'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (data: any) => {
    console.log('Register data:', data)
    setLoading(true)
    setError('')

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate success/error
      if (data.email && data.password) {
        console.log('Registration successful!')
        // TODO: Redirect to login or dashboard
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <RegisterCard onSubmit={handleRegister} loading={loading} error={error} />

      {/* Copyright */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          © 2024 University Name. All rights reserved.
        </p>
      </div>
    </>
  )
}
