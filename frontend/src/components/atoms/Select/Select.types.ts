export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectProps {
  id?: string
  placeholder?: string
  value?: string | number
  onChange?: (value: string | number) => void
  options: SelectOption[]
  disabled?: boolean
  className?: string
  required?: boolean
}
