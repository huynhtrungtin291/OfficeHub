import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { SigninDto } from './dto/signin.dto.js';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() signinDto: SigninDto) {
    return this.authService.signIn(signinDto);
  }

  @Post('refresh')
  async refreshTokens(@Body() body: { email: string; refreshToken: string }) {
    const { email, refreshToken } = body;
    return this.authService.refreshTokens(email, refreshToken);
  }
}
