import { type ReactNode } from 'react'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'consensus'
  | 'link'

export interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  htmlType?: 'button' | 'submit' | 'reset'
  className?: string
}
