import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { ResponseHelper } from '../../common/dto/response.dto';
import type { IUser } from '../../common/interfaces';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message: 'User registered successfully',
        meta: {
          timestamp: '2025-10-09T10:30:00.123Z',
        },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return ResponseHelper.success(undefined, 'User registered successfully');
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user with username or email' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    schema: {
      example: {
        success: true,
        data: {
          user: {
            id: '507f1f77bcf86cd799439011',
            username: 'johndoe',
            email: 'user@example.com',
            role: 'student',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return ResponseHelper.success(result, 'Login successful');
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          user: {
            id: '507f1f77bcf86cd799439011',
            username: 'johndoe',
            email: 'user@example.com',
            role: 'student',
            createdAt: '2025-10-07T10:30:00.000Z',
            updatedAt: '2025-10-07T10:30:00.000Z',
          },
        },
        message: 'Profile retrieved successfully',
      },
    },
  })
  getProfile(@CurrentUser() user: IUser) {
    // Chỉ trả về các trường cần thiết
    const basicUserInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return ResponseHelper.success(
      { user: basicUserInfo },
      'Profile retrieved successfully',
    );
  }
}
