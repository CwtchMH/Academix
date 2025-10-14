import React from "react";
import { Logo, MenuItem, Icon } from "@/components/atoms";
import type { SidebarProps } from "@/components/molecules/Sidebar/Sidebar.types";
import { useAuth } from "@/stores/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Định nghĩa các menu items với đường dẫn (href)
const studentMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Icon name="dashboard" />,
    href: "/dashboard/student/dashboard",
  },
  {
    id: "exams",
    label: "Exams",
    icon: <Icon name="exams" />,
    href: "/dashboard/student/exams",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: <Icon name="certificates" />,
    href: "/dashboard/student/certificates",
  },
];

const teacherMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Icon name="dashboard" />,
    href: "/dashboard",
  },
  {
    id: "courses",
    label: "Courses",
    icon: <Icon name="courses" />,
    href: "/dashboard/teacher/courses",
  },
  {
    id: "exams",
    label: "Exams",
    icon: <Icon name="exams" />,
    href: "/dashboard/teacher/exams/create",
  },
  {
    id: "students",
    label: "Students",
    icon: <Icon name="students" />,
    href: "/dashboard/teacher/students",
  },
  {
    id: "results",
    label: "Results",
    icon: <Icon name="results" />,
    href: "/dashboard/teacher/results",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: <Icon name="certificates" />,
    href: "/dashboard/teacher/certificates",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  className = "",
  onLogoClick,
  isCollapsed = false,
}) => {
  // const { user } = useAuth();
  const pathname = usePathname(); // Hook để lấy đường dẫn hiện tại

  // console.log("User role:", user?.role);
  // console.log("Current pathname:", pathname);

  // Chọn menu dựa trên role của user
  const user = {
    role: "student",
  };
  const menuItems =
    user?.role === "teacher" ? teacherMenuItems : studentMenuItems;

  return (
    <aside className={`bg-white border-r border-gray-200 h-full ${className}`}>
      <div className="py-6 w-full flex justify-center items-center">
        <Logo collapsed={isCollapsed} onClick={onLogoClick} />
      </div>

      <nav className="px-4 pb-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.id}>
              <MenuItem
                icon={item.icon}
                label={isCollapsed ? "" : item.label}
                // Xác định item active dựa trên pathname
                isActive={pathname.startsWith(item.href)}
              />
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
};
