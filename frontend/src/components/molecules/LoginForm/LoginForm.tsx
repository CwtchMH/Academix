'use client'

import { Form } from 'antd'
import { Input, Button, Checkbox, Link } from '@/components/atoms'
import { LoginFormProps, LoginFormData } from './LoginForm.types'

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  const [form] = Form.useForm<LoginFormData>()

  const handleSubmit = async (values: LoginFormData) => {
    onSubmit(values)
  }

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className={`space-y-6 ${className}`}
      initialValues={{ rememberMe: false }}
    >
      <Form.Item
        name="identifier"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập email hoặc tên đăng nhập'
          }
        ]}
      >
        <Input
          id="identifier"
          placeholder="Email hoặc Tên đăng nhập"
          type="text"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập mật khẩu'
          },
          {
            min: 6,
            message: 'Mật khẩu phải có ít nhất 6 ký tự'
          }
        ]}
      >
        <Input id="password" placeholder="Mật khẩu" type="password" />
      </Form.Item>

      <div className="flex items-center justify-between mb-2">
        <Form.Item name="rememberMe" valuePropName="checked" className="!mb-0">
          <Checkbox id="rememberMe" label="Ghi nhớ đăng nhập" />
        </Form.Item>
        <Link href="/forgot-password" className="text-xs sm:text-base">
          Quên mật khẩu?
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Form.Item className="mb-0">
        <Button
          htmlType="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={loading}
        >
          Đăng nhập
        </Button>
      </Form.Item>
    </Form>
  )
}

export default LoginForm
