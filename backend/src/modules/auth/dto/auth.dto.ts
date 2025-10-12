import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username or email address',
  })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'student',
    enum: ['student', 'teacher', 'admin'],
    description: 'User role',
  })
  @IsEnum(['student', 'teacher', 'admin'])
  role: 'student' | 'teacher' | 'admin';
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token issued during login',
  })
  @IsString()
  @MinLength(10)
  refreshToken: string;
}
