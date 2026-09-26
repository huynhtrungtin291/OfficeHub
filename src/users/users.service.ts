import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create.users.dto.js';
import { User } from './schema/users.schema.js';
import { UpdatePasswordDto } from './dto/update.password.dto.js';


@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    // 1. Kiểm tra tồn tại
    const isExists = await this.isUserExists(createUserDto.email);
    if (isExists) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // 2. Hash mật khẩu trước khi lưu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // 3. Khởi tạo và lưu document
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();

    // 4. Định dạng dữ liệu trả về (Bỏ password, chuẩn hóa response)
    const userResponse: any = savedUser.toObject();
    delete userResponse.password;

    return {
      statusCode: 201,
      message: 'Tạo tài khoản người dùng thành công',
      data: userResponse,
    };
  }

  async isUserExists(email: string): Promise<boolean> {
    if (!email) return false;
    const result = await this.userModel.exists({ email });
    return !!result;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel
      .findOne({ email })
      .select('+password')
      .lean()
      .exec()
  }

  async isPsswordValid(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });
  }

  async checkRefreshToken(email: string, refreshToken: string): Promise<boolean> {
    console.log('email', email);
    const user = await this.userModel.findOne({ email }).select('+refreshToken').exec();  
    console.log('user', user);
    if (!user || !user.refreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async updateUserPassword(updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.userModel.findOne({ email: updatePasswordDto.email }).select('+password').exec();
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    const isMatch = await bcrypt.compare(updatePasswordDto.oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không chính xác');
    }
    const hashedNewPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userModel.findByIdAndUpdate(user._id, { password: hashedNewPassword });
  }

}