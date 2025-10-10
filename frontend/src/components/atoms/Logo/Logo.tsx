import React from 'react'
import Image from 'next/image'

export const Logo: React.FC<{ className?: string; collapsed?: boolean }> = ({
  className = '',
  collapsed = false
}) => {
  return (
    <div
      className={`flex items-center justify-center ${
        collapsed ? '' : 'space-x-2'
      } ${className}`}
    >
      <Image
        src="/academix-logo-white.png"
        alt="Academix Logo"
        width={34}
        height={34}
        className="h-auto w-auto"
        priority
      />
      {!collapsed && (
        <span className="text-2xl font-semibold text-gray-800 dark:text-white">
          Academix
        </span>
      )}
    </div>
  )
}
