import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 100 })
  name: string;

  @Prop({ type: String, default: null, trim: true, minlength: 2, maxlength: 5 })
  departmentCode: string;
  
  @Prop({ type: String, default: null, trim: true, maxlength: 255 })
  description: string;
  
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: 'ObjectId', ref: 'User' })
  manager: Types.ObjectId | null;

  @Prop({ type: 'ObjectId', ref: 'Conversation' })
  conversationId: Types.ObjectId | null;


}

export const DepartmentSchema = SchemaFactory.createForClass(Department);