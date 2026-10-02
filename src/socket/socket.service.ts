import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service.js';
import { CreateMessageDto } from '../messages/dto/create-message.dto.js';

@Injectable()
export class SocketService {
  constructor(private readonly messagesService: MessagesService) {}

  createMessage(createMessageDto: CreateMessageDto) {
    return this.messagesService.createMessage(createMessageDto);
  }

  markConversationRead(conversationId: string, userId: string) {
    return this.messagesService.markConversationRead(conversationId, userId);
  }
}
