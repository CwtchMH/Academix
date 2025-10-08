'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import { Card, Descriptions, Tag, Spin, Button, Space } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { clearAuth } from '@/services/utils/auth.utils'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, clearUser } = useAuth()

  const handleLogout = () => {
    clearAuth()
    clearUser()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        {/* User Card */}
        <Card
          title={
            <Space>
              <UserOutlined />
              <span>Thông tin tài khoản</span>
            </Space>
          }
          extra={
            <Tag color={user?.role === 'teacher' ? 'blue' : 'green'}>
              {user?.role === 'teacher' ? 'Giáo viên' : 'Sinh viên'}
            </Tag>
          }
        >
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
                  <span>Vai trò</span>
                </Space>
              }
            >
              <Tag color={user?.role === 'teacher' ? 'blue' : 'green'}>
                {user?.role === 'teacher' ? 'Giáo viên' : 'Sinh viên'}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined />
                  <span>Ngày tạo</span>
                </Space>
              }
            >
              {new Date(user!.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <Space>
                  <CalendarOutlined />
                  <span>Cập nhật lần cuối</span>
                </Space>
              }
            >
              {new Date(user!.updatedAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Actions */}
        <Card className="mt-6">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block size="large">
              Chỉnh sửa thông tin
            </Button>
            <Button block size="large">
              Đổi mật khẩu
            </Button>
            <Button block size="large" onClick={() => router.back()}>
              Quay lại
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  )
}
