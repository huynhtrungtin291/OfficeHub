import { Injectable } from '@nestjs/common';

import { UsersService } from '../users/users.service.js';
import { SigninDto } from './dto/signin.dto.js';
@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}
    async signIn(signinDto: SigninDto) {
        // 1. Kiểm tra email tồn tại
        const user: any = await this.usersService.findUserByEmail(signinDto.email);
        if (!user) {
            throw new Error('Email không tồn tại');
        }
        // 2. Kiểm tra password
        const isPasswordValid = await this.usersService.isPsswordValid(signinDto.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu không chính xác');
        }
        delete user.password; // Xóa password trước khi trả về
        return {
            statusCode: 200,
            message: 'Đăng nhập thành công',
            data: user,
        };
    }
}
