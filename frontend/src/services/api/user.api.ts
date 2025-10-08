import { AuthService } from '../index'

export interface UserProfile {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher'
  createdAt: string
  updatedAt: string
}

export interface GetProfileResponse {
  success: boolean
  data: {
    user: UserProfile
  }
  message: string
}

/**
 * Get current user profile
 * GET /auth/profile
 */
export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await AuthService.apiMethod.get<GetProfileResponse>({
    url: '/profile'
  })
  return response
}
