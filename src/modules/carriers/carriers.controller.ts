import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { CreateCarrierDto, UpdateCarrierDto } from './dto/carrier.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/modules/users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('carriers')
@ApiBearerAuth()
@Controller('carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Create a new carrier' })
  create(@Body() dto: CreateCarrierDto) {
    return this.carriersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carriers, optionally filtered by company' })
  findAll(@Query('companyId') companyId?: string) {
    return this.carriersService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a carrier by ID' })
  findOne(@Param('id') id: string) {
    return this.carriersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Update a carrier' })
  update(@Param('id') id: string, @Body() dto: UpdateCarrierDto) {
    return this.carriersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Deactivate a carrier' })
  remove(@Param('id') id: string) {
    return this.carriersService.remove(id);
  }
}
