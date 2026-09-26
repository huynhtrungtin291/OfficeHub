import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { CreateUserDto } from './dto/create.users.dto.js';
import { UsersService } from './users.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { UpdatePasswordDto } from './dto/update.password.dto.js';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @UseGuards(AuthGuard)
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Post('update-password')
  async updateUserPassword(
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    return await this.usersService.updateUserPassword(updatePasswordDto);
  }

}
