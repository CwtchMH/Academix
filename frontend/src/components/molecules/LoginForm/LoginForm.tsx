'use client'

import { useState } from 'react'
import { Form } from 'antd'
import { Input, Button, Checkbox, Link } from '@/components/atoms'
import { FormField } from '@/components/molecules/FormField'
import { LoginFormProps, LoginFormData } from './LoginForm.types'

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  const [form] = Form.useForm()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <FormField>
        <Input
          id="email"
          placeholder="Email or Username"
          type="email"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          required
        />
      </FormField>

      <FormField>
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

      <div className="flex items-center justify-between">
        <Checkbox
          id="rememberMe"
          checked={formData.rememberMe}
          onChange={(checked) =>
            setFormData((prev) => ({ ...prev, rememberMe: checked }))
          }
          label="Remember me"
        />
        <Link href="/forgot-password" className="text-sm">
          Forgot your password?
        </Link>
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
        disabled={!formData.email || !formData.password}
      >
        Sign In
      </Button>
    </form>
  )
}

export default LoginForm
