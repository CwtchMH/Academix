import React from 'react'
import { Logo, MenuItem, Icon } from '@/components/atoms'
import type { SidebarProps } from '@/components/molecules/Sidebar/Sidebar.types'
import { useAuth } from '@/stores/auth'

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  activeItem = 'dashboard',
  onItemClick,
  onLogoClick,
  isCollapsed = false
}) => {
  const { user } = useAuth()
  const menuAllItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Icon name="dashboard" />
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: <Icon name="courses" />
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

  const menuItems =
    user?.role === 'teacher'
      ? menuAllItems.filter(
          (item) =>
            item.id !== 'exams' &&
            item.id !== 'results' &&
            item.id !== 'certificates'
        )
      : menuAllItems.filter((item) => item.id !== 'students')

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full ${className}`}
    >
      <div className="py-6 w-full flex justify-center items-center">
        <Logo collapsed={isCollapsed} onClick={onLogoClick} />
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
