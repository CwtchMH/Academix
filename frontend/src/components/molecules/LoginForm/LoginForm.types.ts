export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void
  loading?: boolean
  error?: string
  className?: string
}
