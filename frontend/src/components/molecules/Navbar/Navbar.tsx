import React from 'react'
import { Notification } from '@/components/atoms'
import { UserDropdown } from '@/components/molecules/UserDropdown'
import type { NavbarProps } from '@/components/molecules/Navbar/Navbar.types'
import { useAuth } from '@/stores/auth'

export const Navbar: React.FC<NavbarProps> = ({
  className = '',
  hasNotification = false
}) => {
  const { user } = useAuth()

  return (
    <header
      className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="my-auto italic text-gray-900 flex items-center text-xl font-bold underline">
          Welcome, <span>{user?.username}</span>
        </div>
        <div className="flex items-center gap-2">
          <Notification hasNotification={hasNotification} />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
