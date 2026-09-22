import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateUserDto } from './dto/create.users.dto.js';
import { User } from './schema/users.schema.js';
@Injectable()
export class UsersService {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {}


    async createUser(createUserDto: CreateUserDto) {
        if (await this.isUserExists(createUserDto.email)){
            return { message: 'User with this email already exists' };
        }
        const createdUser = new this.userModel(createUserDto);
        return createdUser.save();
    }

    async isUserExists(email: string): Promise<boolean> {
        if (!email) {   
            return false;
        }
        const user = await this.userModel.findOne({ email });
        return !!user;
    }
}
//uy nhiên, để DTO thực sự validate request, main.ts cần có ValidationPipe với whitelist và transform.