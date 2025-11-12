/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  UpdateProfileDto,
  VerifyFaceDto,
} from './dto/auth.dto';
import type { IJwtPayload, IUser, IUserProfile } from '../../common/interfaces';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, fullName, email, password, role } = registerDto;

    // Check if username already exists
    const existingUsername = await this.userModel.findOne({ username });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user with role from request
    const newUser = new this.userModel({
      username,
      fullName,
      email,
      passwordHash,
      role,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);
    await this.updateRefreshToken(String(savedUser._id), tokens.refreshToken);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    // Find user by email or username
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(String(user._id), tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    const payload = await this.jwtService
      .verifyAsync<IJwtPayload>(refreshToken)
      .catch(() => {
        throw new UnauthorizedException('Invalid or expired refresh token');
      });

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await argon2.verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(String(user._id), tokens.refreshToken);

    return {
      ...tokens,
    };
  }

  async validateUser(payload: IJwtPayload): Promise<IUserProfile> {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user with password hash
    const user = await this.userModel.findById(userId).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different from current password
    const isSamePassword = await argon2.verify(user.passwordHash, newPassword);
    if (isSamePassword) {
      throw new ConflictException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(newPassword);

    // Update password and clear refresh token for security
    await this.userModel.findByIdAndUpdate(userId, {
      passwordHash: newPasswordHash,
      refreshTokenHash: undefined, // Clear refresh token to force re-login
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { fullName, email, dateOfBirth, imageUrl } = updateProfileDto;

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await this.userModel.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Prepare update object with only provided fields
    const updateData: Partial<{
      fullName: string;
      email: string;
      dateOfBirth: Date;
      imageUrl: string;
    }> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (dateOfBirth !== undefined)
      updateData.dateOfBirth = new Date(dateOfBirth);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    // Update user profile
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: this.sanitizeUser(updatedUser),
      message: 'Profile updated successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName ?? null,
        dateOfBirth: user.dateOfBirth ?? null,
        imageUrl: user.imageUrl ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private async generateTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: IJwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshTokenHash,
    });
  }

  private sanitizeUser(user: UserDocument): IUserProfile {
    return {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName ?? null,
      dateOfBirth: user.dateOfBirth ?? undefined,
      imageUrl: user.imageUrl ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Xác thực khuôn mặt của user bằng Gemini
   * @param user Thông tin user từ JWT
   * @param verifyFaceDto Ảnh webcam base64
   * @returns
   */
  async verifyFace(user: IUser, verifyFaceDto: VerifyFaceDto) {
    this.logger.log(`Starting face verification for user: ${user.username}`);

    const { imageUrl: profileImageUrl } = user;
    const { webcamImage } = verifyFaceDto;

    this.logger.log(`Received webcam image for user: ${user?.username}`);
    this.logger.log(`Profile image URL: ${profileImageUrl}`);
    this.logger.log(`Webcam image : ${webcamImage}`);

    // --- Validation 1: User đã có ảnh profile chưa? ---
    if (!profileImageUrl) {
      throw new BadRequestException(
        'Profile picture not set. Please update your profile.',
      );
    }

    // --- Validation 2: Định dạng Base64 ---
    const webcamImageBase64 = webcamImage.split(',').pop();
    if (!webcamImageBase64) {
      throw new BadRequestException('Invalid webcam image format.');
    }

    let profileImageBase64: string;
    let profileMimeType: string;

    try {
      // --- Step 3: Fetch ảnh profile từ URL (ví dụ: Cloudinary) ---
      this.logger.log(`Fetching profile image from: ${profileImageUrl}`);
      const response = await firstValueFrom(
        this.httpService.get(profileImageUrl, {
          responseType: 'arraybuffer',
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      profileMimeType = response.headers['content-type'] || 'image/jpeg';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      profileImageBase64 = Buffer.from(response.data, 'binary').toString(
        'base64',
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch profile image for user ${user.username}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not retrieve profile image.');
    }

    // --- Step 4: Gọi Gemini API ---
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const systemPrompt =
      "You are an expert security AI. Your task is to determine if two images are of the same person. Respond with only the word 'true' or 'false'.";

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Are these two images of the same person? Image 1 is their official profile. Image 2 is a live webcam snapshot. Answer only "true" or "false".',
            },
            {
              inlineData: {
                mimeType: profileMimeType,
                data: profileImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/jpeg', // ảnh webcam là jpeg
                data: webcamImageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'text/plain',
      },
    };

    try {
      this.logger.log(`Calling Gemini API for user: ${user.username}`);
      const geminiResponse = await firstValueFrom(
        this.httpService.post(apiUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const textResponse =
        geminiResponse.data.candidates[0].content.parts[0].text;
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const decision = textResponse
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, '');

      this.logger.log(`Gemini response for ${user.username}: "${decision}"`);

      // --- Step 5: Xử lý kết quả ---
      if (decision === 'true') {
        return {
          success: true,
          message: 'Face verified successfully.',
        };
      } else {
        this.logger.warn(
          `Face verification failed for user: ${user.username}`,
        );
        return {
          success: false,
          message: 'Face does not match profile. Verification failed.',
        }
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error; // Ném lại lỗi 401
      
      this.logger.error(
        `Gemini API call failed for user ${user.username}`,
        error.response?.data || error.message,
      );
      if (error.response?.status === 403) {
         throw new InternalServerErrorException('Face verification failed: Invalid API Key or permissions.');
      }
      throw new InternalServerErrorException(
        'Face verification service failed.',
      );
    }
  }
}
