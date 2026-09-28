import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enum/role.enum.js';

import { CreateUserDto } from './dto/create.users.dto.js';
import { UsersService } from './users.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { UpdatePasswordDto } from './dto/update.password.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Roles(Role.MANAGER)
  @UseGuards(AuthGuard, RolesGuard)
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
