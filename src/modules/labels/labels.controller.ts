import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { GenerateLabelDto } from './dto/label.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('labels')
@UseGuards(JwtAuthGuard)
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate package labels for a shipment' })
  @ApiResponse({ status: 201, description: 'Labels generated successfully' })
  generate(
    @Request() req: { user: { id: string } },
    @Body() dto: GenerateLabelDto,
  ) {
    return this.labelsService.generateLabels(dto.shipmentId, req.user.id, dto);
  }

  @Get('shipment/:shipmentId')
  @ApiOperation({ summary: 'Get all labels for a shipment' })
  @ApiParam({ name: 'shipmentId', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'List of labels' })
  findByShipment(@Param('shipmentId') shipmentId: string) {
    return this.labelsService.findByShipment(shipmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a label by ID' })
  @ApiParam({ name: 'id', description: 'Label UUID' })
  @ApiResponse({ status: 200, description: 'Label details' })
  findOne(@Param('id') id: string) {
    return this.labelsService.findOne(id);
  }

  @Post(':id/reprint')
  @ApiOperation({ summary: 'Reprint a label' })
  @ApiParam({ name: 'id', description: 'Label UUID' })
  @ApiResponse({ status: 200, description: 'Label reprinted' })
  reprint(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.labelsService.reprint(id, req.user.id);
  }
}
