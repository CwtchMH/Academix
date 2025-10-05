import React from 'react'
import { Logo, Notification, Avatar } from '@/components/atoms'
import type { NavbarProps } from '@/components/molecules/Navbar/Navbar.types'

export const Navbar: React.FC<NavbarProps> = ({
  className = '',
  onNotificationClick,
  onAvatarClick,
  userAvatar,
  hasNotification = false
}) => {
  return (
    <header
      className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 ${className}`}
    >
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <Notification
            hasNotification={hasNotification}
            onClick={onNotificationClick}
          />
          <Avatar
            src={userAvatar}
            size="medium"
            onClick={onAvatarClick}
            className="cursor-pointer"
          />
        </div>
      </div>
    </header>
  )
}
