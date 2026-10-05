import { Body, Controller, Post, Res } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { AuthService } from './auth.service.js';
import { SigninDto } from './dto/signin.dto.js';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  @Post('signin')
  async signIn(
    @Body() signinDto: SigninDto,
    @Res ({ passthrough: true }) res: Response,) {
    console.log('Reponse object:', res); // Log the response object to see its structure
    const data = await this.authService.signIn(signinDto);
    this.httpAdapterHost.httpAdapter.setCookie(res, 'refreshToken', data.token.refreshToken,{
      signed: true,
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return {
      statusCode: data.statusCode,
      message: data.message,
    }
  }

  @Post('refresh')
  async refreshTokens(@Body() body: { email: string; refreshToken: string }) {
    const { email, refreshToken } = body;
    return this.authService.refreshTokens(email, refreshToken);
  }
}
