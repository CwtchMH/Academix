import { AuthService } from "../index";
import type { LoginResponse, RegisterResponse } from "../types";

// ==================== AUTH API ENDPOINTS ====================

/**
 * Login API
 * POST /auth/login
 *
 * @example
 * const loginMutation = useLoginApi()
 * await loginMutation.mutateAsync({ data: { identifier, password } })
 */
export const useLoginApi = () => {
  return AuthService.usePost<LoginResponse>({
    url: "/login",
  });
};

/**
 * Register API
 * POST /auth/register
 *
 * @example
 * const registerMutation = useRegisterApi()
 * await registerMutation.mutateAsync({ data: { fullName, email, password, role } })
 */
export const useRegisterApi = () => {
  return AuthService.usePost<RegisterResponse>({
    url: "/register",
  });
};

/**
 * Logout API (optional - nếu backend có endpoint)
 * POST /auth/logout
 */
export const useLogoutApi = () => {
  return AuthService.usePost<{ success: boolean }>({
    url: "/logout",
  });
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change Password API
 * PUT /auth/change-password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await AuthService.apiMethod.put<ChangePasswordResponse>({
    url: "/change-password",
    data,
  });
  return response;
};
