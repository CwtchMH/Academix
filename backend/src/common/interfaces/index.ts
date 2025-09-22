export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  dateOfBirth?: Date;
  role: 'student' | 'teacher' | 'admin';
  walletAddress?: string;
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
