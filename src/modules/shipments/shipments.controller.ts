import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { DashboardService } from './dashboard.service';
import { CreateShipmentDto, UpdateShipmentDto, AddShipmentPackerDto } from './dto/shipment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboard(
    @Request() req: { user: { companyIds: string[] } },
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo')   dateTo?: string,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to   = dateTo   ? new Date(dateTo)   : undefined;
    return this.dashboardService.getStats(req.user.companyIds, from, to);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  create(@Request() req: { user: { id: string } }, @Body() createDto: CreateShipmentDto) {
    return this.shipmentsService.create(createDto.companyId, req.user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipments' })
  findAll(@Request() req: { user: { companyIds: string[] } }) {
    return this.shipmentsService.findAll(req.user.companyIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shipment by ID' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  update(@Param('id') id: string, @Body() updateDto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark shipment as completed' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  complete(@Param('id') id: string) {
    return this.shipmentsService.complete(id);
  }

  @Post(':id/packers')
  @ApiOperation({ summary: 'Add a packer to shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 201, description: 'Packer added' })
  addPacker(@Param('id') id: string, @Body() dto: AddShipmentPackerDto) {
    return this.shipmentsService.addPacker(id, dto);
  }

  @Delete(':id/packers/:packerId')
  @ApiOperation({ summary: 'Remove a packer from shipment' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiParam({ name: 'packerId', description: 'Packer UUID' })
  removePacker(@Param('id') id: string, @Param('packerId') packerId: string) {
    return this.shipmentsService.removePacker(id, packerId);
  }
}
