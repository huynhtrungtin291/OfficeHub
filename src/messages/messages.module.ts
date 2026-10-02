import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/messages.schema.js';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schema/conversations.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
