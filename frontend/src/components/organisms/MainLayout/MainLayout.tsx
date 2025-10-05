'use client'

import React, { useState } from 'react'
import { Navbar, Sidebar } from '@/components/molecules'
import type { MainLayoutProps } from '@/components/organisms/MainLayout/MainLayout.types'

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = '',
  initialActiveItem = 'dashboard',
  userAvatar,
  hasNotification = false,
  onNotificationClick,
  onAvatarClick,
  onSidebarItemClick
}) => {
  const [activeItem, setActiveItem] = useState(initialActiveItem)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleSidebarItemClick = (itemId: string) => {
    setActiveItem(itemId)
    onSidebarItemClick?.(itemId)
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${className}`}
    >
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-gray-600 dark:text-gray-300"
        >
          <path
            d="M3 12h18M3 6h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        fixed lg:relative z-30
        ${isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        ${
          !isSidebarCollapsed
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }
      `}
      >
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleSidebarItemClick}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar
          userAvatar={userAvatar}
          hasNotification={hasNotification}
          onNotificationClick={onNotificationClick}
          onAvatarClick={onAvatarClick}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
