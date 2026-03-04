import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, CreateClientAddressDto, UpdateClientAddressDto } from './dto/client.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(@Body() createDto: CreateClientDto) {
    return this.clientsService.create(createDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search clients by name or document number' })
  search(
    @Request() req: { user: { companyIds: string[] } },
    @Query('q') query: string,
    @Query('companyId') companyId?: string,
  ) {
    const effectiveCompanyId = companyId || req.user.companyIds?.[0];
    return this.clientsService.search(effectiveCompanyId, query || '');
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients, optionally filtered by company' })
  findAll(@Query('companyId') companyId?: string) {
    return this.clientsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  update(@Param('id') id: string, @Body() updateDto: UpdateClientDto) {
    return this.clientsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  // ── Addresses ─────────────────────────────────────────────────────────────

  @Post(':id/addresses')
  @ApiOperation({ summary: 'Add a logistics address to a client' })
  addAddress(@Param('id') id: string, @Body() dto: CreateClientAddressDto) {
    return this.clientsService.addAddress(id, dto);
  }

  @Patch(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Update a client address' })
  updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: UpdateClientAddressDto,
  ) {
    return this.clientsService.updateAddress(id, addressId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({ summary: 'Delete a client address' })
  removeAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return this.clientsService.removeAddress(id, addressId);
  }
}
