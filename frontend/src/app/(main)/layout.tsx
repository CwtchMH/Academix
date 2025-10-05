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

  const handleAvatarClick = () => {
    console.log('Avatar clicked')
    // Implement user profile logic here
  }

  const handleSidebarItemClick = (itemId: string) => {
    console.log('Sidebar item clicked:', itemId)
    // Implement navigation logic here
  }

  return (
    <MainLayout
      userAvatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
      hasNotification={true}
      onNotificationClick={handleNotificationClick}
      onAvatarClick={handleAvatarClick}
      onSidebarItemClick={handleSidebarItemClick}
      initialActiveItem="dashboard"
    >
      {children}
    </MainLayout>
  )
}

