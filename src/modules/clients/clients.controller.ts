import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created successfully' })
  create(@Body() createDto: CreateClientDto) {
    return this.clientsService.create(createDto.companyId, createDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search clients by name or document number' })
  @ApiResponse({ status: 200, description: 'Matching clients (max 10)' })
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
  @ApiResponse({ status: 200, description: 'List of clients' })
  findAll(@Query('companyId') companyId?: string) {
    return this.clientsService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiResponse({ status: 200, description: 'Client details' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  @ApiResponse({ status: 200, description: 'Client updated' })
  update(@Param('id') id: string, @Body() updateDto: UpdateClientDto) {
    return this.clientsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  @ApiResponse({ status: 200, description: 'Client deleted' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
