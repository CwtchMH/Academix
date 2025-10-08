import { RegisterForm } from '@/components/molecules'
import { Link } from '@/components/atoms'
import Image from 'next/image'
import { RegisterCardProps } from './RegisterCard.types'

const RegisterCard: React.FC<RegisterCardProps> = ({
  onSubmit,
  loading = false,
  error,
  className = ''
}) => {
  return (
    <div
      className={`
      bg-white p-6 sm:p-4 rounded-lg shadow-lg max-w-md w-full mx-auto
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Tạo tài khoản của bạn
        </h1>
        <p className="text-gray-500 sm:text-base text-sm">
          Tham gia và khám phá cổng thông tin của chính mình.
        </p>
      </div>

      {/* Form */}
      <RegisterForm onSubmit={onSubmit} loading={loading} error={error} />

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm lg:text-base">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterCard
