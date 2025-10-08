import { LoginForm } from '@/components/molecules'
import { Link } from '@/components/atoms'
import { LoginCardProps } from './LoginCard.types'
import Image from 'next/image'

const LoginCard: React.FC<LoginCardProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  return (
    <div
      className={`
      bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full mx-auto
      ${className}
    `}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Image
          src="/academix-logo-white.png"
          alt="Academix Logo"
          width={64}
          height={64}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h1>
        <p className="text-gray-500 text-sm lg:text-base">
          Truy cập và khám phá cổng thông tin
        </p>
      </div>

      {/* Form */}
      <LoginForm onSubmit={onSubmit} loading={loading} error={error} />

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm lg:text-base">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginCard
