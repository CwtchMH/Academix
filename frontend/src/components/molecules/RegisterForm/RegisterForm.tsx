'use client'

import { useState } from 'react'
import { Input, Button, Checkbox, Link } from '@/components/atoms'
import { FormField } from '@/components/molecules/FormField'
import { RegisterFormProps, RegisterFormData } from './RegisterForm.types'

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const [validationErrors, setValidationErrors] = useState<
    Partial<RegisterFormData>
  >({})

  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormData> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.agreeToTerms &&
    formData.password === formData.confirmPassword

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <FormField error={validationErrors.fullName}>
        <Input
          id="fullName"
          placeholder="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, fullName: value }))
          }
          required
        />
      </FormField>

      <FormField error={validationErrors.email}>
        <Input
          id="email"
          placeholder="University Email"
          type="email"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          required
        />
      </FormField>

      <FormField error={validationErrors.password}>
        <Input
          id="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          required
        />
      </FormField>

      <FormField error={validationErrors.confirmPassword}>
        <Input
          id="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, confirmPassword: value }))
          }
          required
        />
      </FormField>

      <div className="space-y-2">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(checked) =>
            setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
          }
          label={
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                Terms & Conditions
              </Link>
            </span>
          }
        />
        {validationErrors.agreeToTerms && (
          <p className="text-sm text-red-600">
            {validationErrors.agreeToTerms}
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        htmlType="submit"
        variant="primary"
        size="large"
        fullWidth
        loading={loading}
        disabled={!isFormValid}
      >
        Create Account
      </Button>
    </form>
  )
}

export default RegisterForm
