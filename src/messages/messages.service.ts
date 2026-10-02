import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { Message } from './schema/messages.schema.js';
import { Conversation } from '../conversations/schema/conversations.schema.js';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<Conversation>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto) {
    const conversation = await this.conversationModel.findById(
      createMessageDto.conversationId,
    );
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const message = new this.messageModel(createMessageDto);
    return message.save();
  }

  async markConversationRead(conversationId: string, userId: string) {
    return this.conversationModel.findOneAndUpdate(
      {
        _id: conversationId,
        'members.userId': userId,
      },
      { $set: { 'members.$.lastReadAt': new Date() } },
      { new: true },
    );
  }
}
