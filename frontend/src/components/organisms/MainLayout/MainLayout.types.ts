export interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  initialActiveItem?: string
  userAvatar?: string
  hasNotification?: boolean
  onNotificationClick?: () => void
  onAvatarClick?: () => void
  onSidebarItemClick?: (itemId: string) => void
}
