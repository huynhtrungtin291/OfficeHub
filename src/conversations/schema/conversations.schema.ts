import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ _id: false })
export class ConversationMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;//Id người dùng

  @Prop({ required: true, default: Date.now })
  joinedAt: Date; //Ngày tham gia cuộc trò chuyện

  @Prop({ default: Date.now })
  lastReadAt: Date;//Ngày đọc tin nhắn cuối cùng trong cuộc trò chuyện
}

@Schema({ _id: false })
export class LastMessage {
  @Prop({ required: true, trim: true })
  content: string; //Nội dung tin nhắn

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; //Người gửi tin nhắn

  @Prop({ required: true })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, enum: ['DIRECT', 'GROUP', 'DEPARTMENT'] })
  type: string; //Loại cuộc trò chuyện: DIRECT, GROUP, DEPARTMENT

  @Prop({ type: String, trim: true, maxlength: 150, default: null })
  name: string | null;  //Tên cuộc trò chuyện, chỉ áp dụng cho loại GROUP và DEPARTMENT

  @Prop({ type: Types.ObjectId, ref: 'Department', default: null })
  departmentId: Types.ObjectId | null; //Id phòng ban, chỉ áp dụng cho loại DEPARTMENT

  @Prop({ type: [ConversationMember], default: [] })
  members: ConversationMember[]; //Danh sách thành viên trong cuộc trò chuyện

  @Prop({ type: LastMessage, default: null })
  lastMessage: LastMessage | null; //Thông tin về tin nhắn cuối cùng trong cuộc trò chuyện
}

export const ConversationMemberSchema = SchemaFactory.createForClass(ConversationMember);
export const LastMessageSchema = SchemaFactory.createForClass(LastMessage);
export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ 'members.userId': 1 });
ConversationSchema.index({ departmentId: 1 });
