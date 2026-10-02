import {IsArray, IsEnum, IsMongoId, IsOptional,IsString, MaxLength, MinLength} from 'class-validator';
import { ConversationType} from '../../common/enum/conversation.enum.js';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsArray()
  @IsMongoId({ each: true })
  memberIds: string[];
}
