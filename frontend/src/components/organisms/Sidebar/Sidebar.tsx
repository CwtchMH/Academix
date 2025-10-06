// src/components/organisms/Sidebar/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import logoIcon from '../../../../public/logo-icon.svg'; // Điều chỉnh lại đường dẫn nếu cần

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/exams', icon: 'quiz', label: 'Exams' },
  { href: '/certificates', icon: 'workspace_premium', label: 'Certificates' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-col bg-white border-r border-gray-200 hidden md:flex">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <Image src={logoIcon} alt="logo" width={32} height={32} />
        <h1 className="text-2xl font-bold text-[var(--dark-text)]">Academix</h1>
      </div>
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              pathname.startsWith(item.href) ? 'sidebar-active' : 'sidebar-inactive'
            }`}
          >
            <span className="material-symbols-outlined mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};