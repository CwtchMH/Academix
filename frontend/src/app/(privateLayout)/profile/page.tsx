"use client";

import { useAuth } from "@/stores/auth";
import { Card, Descriptions, Tag, Spin, Button, Space, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import UploadImage from "./UploadImage";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isOpenEditProfileModal, setIsOpenEditProfileModal] =
    useState<boolean>(false);
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState<boolean>(false);
  const [isOpenUploadImageModal, setIsOpenUploadImageModal] =
    useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <Space direction="vertical" size="large" align="center">
            <span>User not found.</span>
            <Button type="primary" href="/login">
              Đăng nhập lại
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>
          </div>

          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Personal Information</span>
              </Space>
            }
            extra={
              <Tag color={user?.role === "teacher" ? "blue" : "green"}>
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </Tag>
            }
            className="shadow-md"
          >
            {user?.imageUrl ? (
              <img
                src={user?.imageUrl}
                alt="Student Image"
                className="w-[200px] h-[200px]"
              />
            ) : (
              "The user has not uploaded an image yet."
            )}
            <Descriptions column={1} bordered>
              <Descriptions.Item
                label={
                  <Space>
                    <IdcardOutlined />
                    <span>ID</span>
                  </Space>
                }
              >
                {user?.id}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    <span>Username</span>
                  </Space>
                }
              >
                {user?.username}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    <span>Full Name</span>
                  </Space>
                }
              >
                {user?.fullName || "--"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined />
                    <span>Date of Birth</span>
                  </Space>
                }
              >
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "--"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined />
                    <span>Email</span>
                  </Space>
                }
              >
                {user?.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <IdcardOutlined />
                    <span>Role</span>
                  </Space>
                }
              >
                <Tag color={user?.role === "teacher" ? "blue" : "green"}>
                  {user?.role === "teacher" ? "Teacher" : "Student"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="!mt-6 shadow-md">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                size="large"
                onClick={() => setIsOpenUploadImageModal(true)}
              >
                Upload Image
              </Button>
              <Button
                block
                size="large"
                onClick={() => setIsOpenEditProfileModal(true)}
              >
                Edit Personal Information
              </Button>
              <Button
                block
                size="large"
                onClick={() => setIsOpenChangePasswordModal(true)}
              >
                Change Password
              </Button>
            </Space>
          </Card>
        </div>

        {isOpenEditProfileModal && (
          <EditProfileModal
            isOpen={isOpenEditProfileModal}
            onClose={() => setIsOpenEditProfileModal(false)}
            onSuccess={() => {}}
          />
        )}

        {isOpenChangePasswordModal && (
          <ChangePasswordModal
            isOpen={isOpenChangePasswordModal}
            onClose={() => setIsOpenChangePasswordModal(false)}
            onSuccess={() => {
              console.log("Password changed successfully!");
              messageApi.success("Password changed successfully!");
            }}
            onError={(error) => {
              messageApi.error(error);
            }}
          />
        )}
        {isOpenUploadImageModal && (
          <UploadImage
            isOpen={isOpenUploadImageModal}
            onClose={() => setIsOpenUploadImageModal(false)}
          />
        )}
      </div>
    </>
  );
}
