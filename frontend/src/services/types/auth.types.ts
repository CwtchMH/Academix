// ==================== AUTH REQUEST TYPES ====================

export interface LoginRequest {
  identifier: string // Email hoặc username
  password: string
}

export interface RegisterRequest {
  fullName: string
  username: string
  email: string
  password: string
  role: 'student' | 'teacher'
}

// ==================== AUTH RESPONSE TYPES ====================

export interface User {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message?: string // Error message nếu có
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export type LoginResponse = AuthResponse
export type RegisterResponse = AuthResponse
