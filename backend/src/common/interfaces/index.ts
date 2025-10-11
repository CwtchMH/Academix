export interface IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName?: string;
  dateOfBirth?: Date;
  role: 'student' | 'teacher' | 'admin';
  walletAddress?: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequestWithUser extends Request {
  user: IUser;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  iat?: number;
  exp?: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}
