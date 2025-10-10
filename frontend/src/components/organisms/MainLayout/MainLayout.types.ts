export interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  initialActiveItem?: string
  hasNotification?: boolean
  onNotificationClick?: () => void
  onSidebarItemClick?: (itemId: string) => void
}
