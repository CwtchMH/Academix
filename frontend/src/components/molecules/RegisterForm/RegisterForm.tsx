'use client'

import { Form, Select } from 'antd'
import { Input, Button, Checkbox, Link } from '@/components/atoms'
import { RegisterFormProps, RegisterFormData } from './RegisterForm.types'

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  const [form] = Form.useForm<RegisterFormData>()

  const handleSubmit = async (values: RegisterFormData) => {
    onSubmit(values)
  }

  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className={`space-y-6 ${className}`}
      initialValues={{ agreeToTerms: false }}
    >
      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập tên đăng nhập'
          },
          {
            min: 2,
            message: 'Tên đăng nhập phải có ít nhất 2 ký tự'
          },
          {
            whitespace: true,
            message: 'Tên đăng nhập không được chỉ chứa khoảng trắng'
          }
        ]}
      >
        <Input id="username" placeholder="Tên đăng nhập" type="text" />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập email'
          },
          {
            type: 'email',
            message: 'Email không hợp lệ'
          }
        ]}
      >
        <Input id="email" placeholder="Email" type="email" />
      </Form.Item>

      <Form.Item
        name="role"
        rules={[
          {
            required: true,
            message: 'Vui lòng chọn vai trò'
          }
        ]}
      >
        <Select
          placeholder="Chọn vai trò"
          size="large"
          options={[
            { label: 'Học sinh / Sinh viên', value: 'student' },
            { label: 'Giáo viên', value: 'teacher' }
          ]}
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
          },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Mật khẩu phải chứa chữ hoa, chữ thường và số'
          }
        ]}
      >
        <Input id="password" placeholder="Mật khẩu" type="password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          {
            required: true,
            message: 'Vui lòng xác nhận mật khẩu'
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('Mật khẩu không khớp'))
            }
          })
        ]}
      >
        <Input
          id="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          type="password"
        />
      </Form.Item>

      <Form.Item
        name="agreeToTerms"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(
                    new Error('Bạn phải đồng ý với điều khoản và điều kiện')
                  )
          }
        ]}
      >
        <Checkbox
          id="agreeToTerms"
          label={
            <span>
              Tôi đồng ý với{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                Điều khoản & Điều kiện
              </Link>
            </span>
          }
        />
      </Form.Item>

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
          Tạo tài khoản
        </Button>
      </Form.Item>
    </Form>
  )
}

export default RegisterForm
