import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop({
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
    index: true,
  })
  role: 'student' | 'teacher' | 'admin';

  @Prop({ unique: true, sparse: true })
  walletAddress?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ walletAddress: 1 });
UserSchema.index({ createdAt: -1 });
