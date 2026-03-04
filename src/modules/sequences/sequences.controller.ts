import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateSequenceConfigDto } from './dto/update-sequence-config.dto';
import { SequencesService } from './sequences.service';

@ApiTags('sequences')
@ApiBearerAuth()
@Controller('sequences')
@UseGuards(JwtAuthGuard)
export class SequencesController {
  constructor(private readonly sequencesService: SequencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get sequence configs for all user companies' })
  findAll(@Request() req: { user: { companyIds: string[] } }) {
    return this.sequencesService.findAllForCompanies(req.user.companyIds);
  }

  @Patch(':companyId')
  @ApiOperation({ summary: 'Update sequence config for a company' })
  update(
    @Request() req: { user: { companyIds: string[] } },
    @Param('companyId') companyId: string,
    @Body() dto: UpdateSequenceConfigDto,
  ) {
    if (!req.user.companyIds.includes(companyId)) throw new ForbiddenException();
    return this.sequencesService.updateConfig(companyId, dto);
  }

  @Post(':companyId/reset')
  @ApiOperation({ summary: 'Reset sequence counter to 0 for a company' })
  reset(
    @Request() req: { user: { companyIds: string[] } },
    @Param('companyId') companyId: string,
  ) {
    if (!req.user.companyIds.includes(companyId)) throw new ForbiddenException();
    return this.sequencesService.resetSequence(companyId);
  }
}
