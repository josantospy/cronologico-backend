import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentDetail } from './entities/shipment-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentDetail])],
  exports: [TypeOrmModule],
})
export class ShipmentDetailsModule {}
