import React from 'react'
import { Logo, MenuItem, Icon } from '@/components/atoms'
import type { SidebarProps } from '@/components/molecules/Sidebar/Sidebar.types'

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  activeItem = 'dashboard',
  onItemClick,
  isCollapsed = false
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Icon name="dashboard" />
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: <Icon name="exams" />
    },
    {
      id: 'students',
      label: 'Students',
      icon: <Icon name="students" />
    },
    {
      id: 'results',
      label: 'Results',
      icon: <Icon name="results" />
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: <Icon name="certificates" />
    }
  ]

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full ${className}`}
    >
      <div className="p-6">
        <Logo className={isCollapsed ? 'w-6 h-6' : 'w-8 h-8'} />
      </div>

      <nav className="px-4 pb-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={isCollapsed ? '' : item.label}
              isActive={activeItem === item.id}
              onClick={() => onItemClick?.(item.id)}
            />
          ))}
        </div>
      </nav>
    </aside>
  )
}
