import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { IUser, IJwtPayload } from '../../common/interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      fullName,
      dateOfBirth,
      role = 'student',
      walletAddress,
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if wallet address already exists (if provided)
    if (walletAddress) {
      const existingWallet = await this.userModel.findOne({ walletAddress });
      if (existingWallet) {
        throw new ConflictException('Wallet address already registered');
      }
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create user
    const newUser = new this.userModel({
      email,
      passwordHash,
      fullName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      role,
      walletAddress,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
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

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async validateUser(payload: IJwtPayload): Promise<IUser> {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: IJwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };

    // Disable ESLint for these lines as JwtService typing issue
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const accessToken = (await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    })) as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const refreshToken = (await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    })) as string;

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserDocument): IUser {
    return {
      id: String(user._id),
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
