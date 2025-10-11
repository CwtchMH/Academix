export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'consensus'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  htmlType?: 'button' | 'submit' | 'reset'
  className?: string
}
