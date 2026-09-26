import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service.js';
import { SigninDto } from './dto/signin.dto.js';

interface JwtPayload {
    _id: string;
    fullName: string;
    email: string;
    avatar: string;
    role: string;
    department: string;
    position: string;
    isActive: boolean;
    status: string;
    
}
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService, 
        private readonly jwtService: JwtService) {}
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

        const token = await this.generateTokens( user );
        return {
            statusCode: 200,
            message: 'Đăng nhập thành công',
            token: token,
        };
    }

    async generateTokens(user: any): Promise<object> {
        const payload: JwtPayload = {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            department: user.department,
            position: user.position,
            isActive: user.isActive,
            status: user.status,
        };
        const accessToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' });
        const refreshToken = await this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
        await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);      
        return { accessToken, refreshToken };
    }

    async refreshTokens(email: string, refreshToken: string): Promise<object> {
        
        const isValid: boolean =  await this.usersService.checkRefreshToken(email, refreshToken);
        if (!isValid) {
            throw new Error('Refresh token không hợp lệ');
        }
        const user: any = await this.usersService.findUserByEmail(email);
        if (!user) {
            throw new Error('Người dùng không tồn tại');
        }
        return await this.generateTokens(user);
  

    }


}
