import { Select as AntSelect } from 'antd'
import { SelectProps } from './Select.types'

const Select: React.FC<SelectProps> = ({
  id,
  placeholder = 'Chọn...',
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  required = false
}) => {
  return (
    <AntSelect
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={options}
      disabled={disabled}
      className={`w-full !h-10 ${className}`}
      size="large"
      allowClear // ← Cho phép clear selection
    />
  )
}

export default Select
