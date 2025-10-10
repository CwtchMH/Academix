'use client'

import React from 'react'
import { MainLayout } from '@/components/organisms'

export default function MainLayoutWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const handleNotificationClick = () => {
    console.log('Notification clicked')
    // Implement notification logic here
  }

  const handleSidebarItemClick = (itemId: string) => {
    console.log('Sidebar item clicked:', itemId)
    // Implement navigation logic here
  }

  return (
    <MainLayout
      hasNotification={true}
      onNotificationClick={handleNotificationClick}
      onSidebarItemClick={handleSidebarItemClick}
      initialActiveItem="dashboard"
    >
      {children}
    </MainLayout>
  )
}
