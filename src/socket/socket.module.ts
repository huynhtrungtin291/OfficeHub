import { Module } from '@nestjs/common';

import { MessagesModule } from '../messages/messages.module.js';
import { SocketGateway } from './socket.gateway.js';
import { SocketService } from './socket.service.js';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Module({
  imports: [MessagesModule, JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } })],
  providers: [SocketGateway, SocketService, AuthGuard],
})
export class SocketModule {}
