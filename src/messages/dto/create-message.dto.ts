import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MessageType } from '../../common/enum/message.enum.js';


export class CreateMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsMongoId()
  senderId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
