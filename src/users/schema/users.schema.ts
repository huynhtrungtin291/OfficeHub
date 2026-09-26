import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email: string;

  @Prop({ required: true, minlength: 8, select: false })
  password: string;

  @Prop({ default: null, trim: true })
  avatar: string;

  @Prop({
    required: true,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee',
  })
  role: string;
  @Prop({ type: 'ObjectId', ref: 'Department' })
  department: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  position: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    enum: ['online', 'offline'],
    default: 'offline',
  })
  status: string;

  @Prop({ type: String, default: null, select: false })
  refreshToken?: string | null;
}
export const UserSchema = SchemaFactory.createForClass(User);
