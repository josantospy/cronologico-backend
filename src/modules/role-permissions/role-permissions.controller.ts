import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('role-permissions')
@ApiBearerAuth()
@Controller('role-permissions')
@UseGuards(JwtAuthGuard)
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put(':rol')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('rol') rol: string, @Body() body: { features: string[] }) {
    return this.service.updateRole(rol, body.features);
  }
}
