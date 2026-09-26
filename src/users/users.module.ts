import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {JwtModule} from '@nestjs/jwt';

import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User, UserSchema } from './schema/users.schema.js';
import { AuthGuard } from '../common/guards/auth.guard.js';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
