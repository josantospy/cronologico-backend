import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentPacker } from './entities/shipment-packer.entity';
import { ShipmentsService } from './shipments.service';
import { DashboardService } from './dashboard.service';
import { ShipmentsController } from './shipments.controller';
import { SequencesModule } from '../../modules/sequences/sequences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentPacker]),
    SequencesModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, DashboardService],
  exports: [ShipmentsService, DashboardService],
})
export class ShipmentsModule {}
