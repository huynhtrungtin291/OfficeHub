import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create.users.dto.js';
import { User } from './schema/users.schema.js';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


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
}