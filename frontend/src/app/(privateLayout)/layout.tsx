// src/app/(privateLayout)/layout.tsx
import React from "react";
import { Sidebar } from "@/components/organisms/Sidebar/Sidebar";
import { Header } from "@/components/layout/Header";

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-[var(--light-gray)]">
      {/* Sử dụng component Sidebar mới */}
      <Sidebar />
      
      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sử dụng component Header đã được nâng cấp */}
        <Header />

        {/* Đây là nơi các trang con (như ExamsPage) sẽ được render */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;