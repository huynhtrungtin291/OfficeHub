import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service.js';
import { CreateDepartmentDto } from './dto/departments.dto.js';
import { Role } from '../common/enum/role.enum.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthGuard } from '../common/guards/auth.guard.js';


@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('create')
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.createDepartment(createDepartmentDto);
  }


  @Roles(Role.ADMIN, Role.MANAGER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('add-member')
  async addMemberToDepartment(@Body() { departmentCode, email }: { departmentCode: string; email: string }) {
    return this.departmentsService.addMemberToDepartment(departmentCode, email);
  }
}
