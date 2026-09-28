import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateDepartmentDto } from './dto/departments.dto.js';
import { Department } from './schema/department.schame.js';
import { User } from '../users/schema/users.schema.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel('Department')
    private readonly departmentModel: Model<Department>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly userService: UsersService,
  ) {}

  async createDepartment(createDepartmentDto: CreateDepartmentDto) {
    const { emailManager, ...departmentData } = createDepartmentDto;
    const departmentCode = createDepartmentDto.departmentCode;
    if (await this.isDepartmentExists(departmentCode)) {
      throw new Error('Mã phòng ban đã tồn tại');
    }
    if (!emailManager) {
      const createdDepartment = new this.departmentModel({
        ...departmentData,
        manager: null,
      });
      const savedDepartment = await createdDepartment.save();
      return {
        statusCode: 201,
        message: 'Tạo phòng ban thành công',
        data: savedDepartment,
      };
    }
    const idManager = ( await this.userService.getUserIdByEmail(emailManager))?.toString();
    if (!idManager) {
      throw new Error('Người dùng không tồn tại');
    }
    if (await this.userService.isUserManager(idManager)) {
      if (await this.departmentModel.exists({ manager: idManager })) {
        throw new Error('Người dùng đã là trưởng phòng của một phòng ban khác');
      }
      const createdDepartment = new this.departmentModel({
        ...departmentData,
        manager: idManager,
      });
      const savedDepartment = await createdDepartment.save();
      return {
        statusCode: 201,
        message: 'Tạo phòng ban thành công',
        data: savedDepartment,
      };
    } else {
      throw new Error(
        'Người dùng không tồn tại hoặc không phải là trưởng phòng',
      );
    }
  }

  async deleteDepartment(departmentCode: string): Promise<object> {
    const department = await this.departmentModel.findOneAndDelete({
      departmentCode,
    });
    if (!department) {
      throw new Error('Phòng ban không tồn tại');
    }
    return {
      statusCode: 200,
      message: 'Xóa phòng ban thành công',
      data: department,
    };
  }

  async addMemberToDepartment(
    departmentCode: string,
    email: string,
  ): Promise<object> {
    const department = await this.departmentModel.findOne({
      departmentCode: departmentCode,
    });
    if (!department) {
      throw new Error('Phòng ban không tồn tại');
    }
    const user = await this.userModel.findOneAndUpdate(
      { email: email },
      { department: department._id },
      { new: true },
    );

    return {
      statusCode: 200,
      message: 'Thêm thành viên vào phòng ban thành công',
      data: user,
    };
  }

  async removeMemberFromDepartment(
    departmentCode: string,
    email: string,
  ): Promise<object> {
    const department = await this.departmentModel.findOne({
      departmentCode: departmentCode,
    });
    if (!department) {
      throw new Error('Phòng ban không tồn tại');
    }
    const user = await this.userModel.findOneAndUpdate(
      { email: email },
      { department: null },
      { new: true },
    );
    if (!user) {
      throw new Error('Thành viên không tồn tại trong phòng ban');
    }
    return {
      statusCode: 200,
      message: 'Xóa thành viên khỏi phòng ban thành công',
      data: user,
    };
  }

  async changeMemberDepartment(
    email: string,
    newDepartmentCode: string,
    oldDepartmentCode: string,
  ): Promise<object> {
    this.removeMemberFromDepartment(oldDepartmentCode, email);
    this.addMemberToDepartment(newDepartmentCode, email);
    return {
      statusCode: 200,
      message: 'Chuyển thành viên sang phòng ban mới thành công',
    };
  }

  async setManagerForDepartment(
    departmentCode: string,
    managerEmail: string,
  ): Promise<object> {
    const department = await this.departmentModel.findOne({
      code: departmentCode,
    });
    if (!department) {
      throw new Error('Phòng ban không tồn tại');
    }

    if (department.manager !== null) {
      throw new Error('Phòng ban đã có trưởng phòng');
    }
    const user = await this.userModel.findOne({ email: managerEmail });
    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }
    if (user.role !== 'manager') {
      throw new Error('Người dùng không phải là trưởng phòng');
    }
    department.manager = user._id;
    await department.save();
    return {
      statusCode: 200,
      message: 'Đặt người quản lý cho phòng ban thành công',
      data: department,
    };
  }

  async removeManagerFromDepartment(departmentCode: string): Promise<object> {
    const department = await this.departmentModel.findOneAndUpdate(
      { code: departmentCode },
      { manager: null },
      { new: true },
    );
    return {
      statusCode: 200,
      message: 'Xóa người quản lý khỏi phòng ban thành công',
      data: department,
    };
  }

  async isDepartmentExists(departmentCode: string): Promise<boolean> {
    if (!departmentCode) return false;
    const result = await this.departmentModel.exists({ departmentCode });
    return !!result;
  }
}
