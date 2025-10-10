import React from 'react'
import { Notification } from '@/components/atoms'
import { UserDropdown } from '@/components/molecules/UserDropdown'
import type { NavbarProps } from '@/components/molecules/Navbar/Navbar.types'
import { useAuth } from '@/stores/auth'

export const Navbar: React.FC<NavbarProps> = ({
  className = '',
  onNotificationClick,
  hasNotification = false
}) => {
  const { user } = useAuth()

  return (
    <header
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex">
          <p className="italic text-gray-900 font-bold dark:text-gray-300 underline">
            Chào mừng <span>{user?.username}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Notification
            hasNotification={hasNotification}
            onClick={onNotificationClick}
          />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
