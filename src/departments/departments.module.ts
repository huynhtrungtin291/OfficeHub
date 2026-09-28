import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { DepartmentsController } from './departments.controller.js';
import { DepartmentsService } from './departments.service.js';
import { DepartmentSchema } from './schema/department.schame.js';
import { UserSchema } from '../users/schema/users.schema.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Department', schema: DepartmentSchema },
    { name: 'User', schema: UserSchema }
  ]), UsersModule, JwtModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, AuthGuard, RolesGuard],
  exports: [DepartmentsService]
})
export class DepartmentsModule {}
