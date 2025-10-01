import { RegisterForm } from '@/components/molecules'
import { Link } from '@/components/atoms'
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
      bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-md w-full mx-auto
      ${className}
    `}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Create your account
        </h1>
        <p className="text-gray-500">
          Join our secure online examination platform.
        </p>
      </div>

      {/* Form */}
      <RegisterForm onSubmit={onSubmit} loading={loading} error={error} />

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterCard
