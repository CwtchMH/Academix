export type BadgeVariant = 'default' | 'active' | 'scheduled' | 'completed'

export interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}
