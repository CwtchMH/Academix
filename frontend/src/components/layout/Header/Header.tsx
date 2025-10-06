// src/components/layout/Header/Header.tsx
"use client";

import { Avatar, Divider, Popover, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import Image from "next/image";

export const Header = () => {
  // Dữ liệu người dùng mẫu
  const user = {
    name: 'Alex Johnson',
    studentId: '123456',
    avatar: '/path-to-your-avatar.jpg', // Thay bằng ảnh thật hoặc dùng UserOutlined
  };

  const content = (
    <div className="min-w-[200px]">
      <p className="font-semibold">{user.name}</p>
      <p className="text-xs text-gray-500 mb-2">Student</p>
      <Divider className="!my-2" />
      <div className="p-1 hover:bg-gray-100 rounded cursor-pointer">
        <Space>
          <UserOutlined />
          <span>My profile</span>
        </Space>
      </div>
      <Divider className="!my-2" />
      <div className="p-1 hover:bg-gray-100 rounded cursor-pointer text-red-500">
        <Space>
          <LogoutOutlined />
          <span>Logout</span>
        </Space>
      </div>
    </div>
  );

  return (
    <header className="flex items-center justify-end whitespace-nowrap bg-white px-10 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Nút thông báo */}
        <button className="relative rounded-full p-2 text-[var(--medium-text)] hover:bg-gray-100 hover:text-[var(--dark-text)] transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Popover cho User */}
        <Popover
          content={content}
          title={null}
          trigger={["click"]}
          arrow={false}
          placement="bottomRight"
        >
          <div className="flex items-center gap-3 cursor-pointer">
             <Avatar size={40} icon={<UserOutlined />} /> {/* Hoặc dùng Image nếu có ảnh */}
             {/* <Image src={user.avatar} alt="User avatar" width={40} height={40} className="rounded-full" /> */}
            <div className="text-sm">
              <div className="font-semibold text-[var(--dark-text)]">{user.name}</div>
              <div className="text-[var(--light-text)]">Student ID: {user.studentId}</div>
            </div>
          </div>
        </Popover>
      </div>
    </header>
  );
};