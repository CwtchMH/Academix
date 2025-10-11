export interface SidebarProps {
  className?: string
  activeItem?: string
  onItemClick?: (itemId: string) => void
  isCollapsed?: boolean
  onLogoClick?: () => void
}
