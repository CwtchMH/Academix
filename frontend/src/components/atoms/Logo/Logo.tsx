import React from 'react'
import Image from 'next/image'

export const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/academix-logo-white.png"
        alt="Academix Logo"
        width={30}
        height={30}
        className="h-auto w-auto"
        priority
      />
      <span className="text-xl font-semibold text-gray-800 dark:text-white">
        Academix
      </span>
    </div>
  )
}
