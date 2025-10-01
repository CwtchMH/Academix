import { LoginForm } from '@/components/molecules'
import { Link } from '@/components/atoms'
import { LoginCardProps } from './LoginCard.types'

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
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-white rounded-sm"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          University Login
        </h1>
        <p className="text-gray-500">Access your student portal</p>
      </div>

      {/* Form */}
      <LoginForm onSubmit={onSubmit} loading={loading} error={error} />

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginCard
