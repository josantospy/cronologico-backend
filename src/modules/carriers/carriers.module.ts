import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrier } from './entities/carrier.entity';
import { CarriersService } from './carriers.service';
import { CarriersController } from './carriers.controller';
import { Company } from '@/modules/companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrier, Company])],
  controllers: [CarriersController],
  providers: [CarriersService],
  exports: [TypeOrmModule],
})
export class CarriersModule {}
