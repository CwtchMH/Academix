import React from 'react'
import { MenuItemProps } from './MenuItem.types'

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
        ${
          isActive
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            : 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }
        ${className}
      `}
    >
      <div className={`w-5 h-5 flex items-center justify-center`}>{icon}</div>
      <span
        className={`text-base ${isActive ? 'font-semibold' : 'font-normal'}`}
      >
        {label}
      </span>
    </button>
  )
}
