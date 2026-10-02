import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { Conversation } from './schema/conversations.schema.js';


@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name,)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto) {
    if (createConversationDto.departmentId) {
      const isExist = await this.isConversationExistWitDepartmentId(createConversationDto.departmentId);
      if (isExist) {
        throw new Error('A conversation with this departmentId already exists.');
      }
    }
    const createdConversation = new this.conversationModel(createConversationDto);
    return createdConversation.save();
  }

  async addMemberToConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    const isMember = conversation.members.some((member) => member.userId.toString() === userId.toString(), );
  
    if (!isMember) {
      conversation.members.push({ userId: new Types.ObjectId(userId), joinedAt: new Date(), lastReadAt: new Date() });
      return conversation.save();
    }
    return conversation;
  }

  async isConversationExistWitDepartmentId(departmentId: string): Promise<boolean> {
    if (!departmentId) {
      return false;
    }
    const conversation = await this.conversationModel.findOne({ departmentId: new Types.ObjectId(departmentId) });
    return !!conversation;
  }


}
