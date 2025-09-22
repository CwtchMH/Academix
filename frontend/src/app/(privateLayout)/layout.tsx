import { Header } from "@/components/layout/Header";
import MainMenu from "@/components/layout/MainMenu";
import React from "react";
import logoIcon from "../../../public/logo-icon.svg";
import { Divider, Space } from "antd";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* <Header /> */}
      <main className="flex min-h-[100vh]">
        <div className=" w-full max-w-[236px] bg-white px-2">
          <Space align="center" className="my-4 mx-2">
            <Image src={logoIcon.src} alt="logo" width={32} height={32} />
            <p className="font-bold text-[24px] text-black">Academix</p>
          </Space>
          <Divider className="!my-2" />
          <MainMenu />
        </div>
        <div className="flex-1 max-w-[calc(100%-236px)]">
          <Header />
          <div className="content relative px-10 py-8 bg-[#f9fafb] min-h-[100vh]">
            <div>{children}</div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Layout;
