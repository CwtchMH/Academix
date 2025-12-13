import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop({ type: String, trim: true })
  imageUrl?: string;

  // Face Embedding for face authentication
  @Prop({ type: [Number], select: false })
  faceEmbedding?: number[];

  @Prop({ type: String })
  embeddingVersion?: string;

  @Prop({
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
    index: true,
  })
  role: 'student' | 'teacher' | 'admin';

  @Prop({ unique: true, sparse: true })
  walletAddress?: string;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
