export interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void
  loading?: boolean
  error?: string
  className?: string
}
