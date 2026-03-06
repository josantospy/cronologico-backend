import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ClientsModule } from './modules/clients/clients.module';
import { CarriersModule } from './modules/carriers/carriers.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { LabelsModule } from './modules/labels/labels.module';
import { SequencesModule } from './modules/sequences/sequences.module';
import { Company } from './modules/companies/entities/company.entity';
import { User } from './modules/users/entities/user.entity';
import { Client } from './modules/clients/entities/client.entity';
import { ClientAddress } from './modules/clients/entities/client-address.entity';
import { Carrier } from './modules/carriers/entities/carrier.entity';
import { Shipment } from './modules/shipments/entities/shipment.entity';
import { ShipmentPacker } from './modules/shipments/entities/shipment-packer.entity';
import { PackageLabel } from './modules/labels/entities/label.entity';
import { SequenceConfig } from './modules/sequences/entities/sequence-config.entity';
import { RolePermissionsModule } from './modules/role-permissions/role-permissions.module';
import { RolePermission } from './modules/role-permissions/entities/role-permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'freight_management'),
        ssl: configService.get('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : false,
        entities: [
          Company,
          User,
          Client,
          ClientAddress,
          Carrier,
          Shipment,
          ShipmentPacker,
          PackageLabel,
          SequenceConfig,
          RolePermission,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CompaniesModule,
    ClientsModule,
    CarriersModule,
    ShipmentsModule,
    LabelsModule,
    SequencesModule,
    RolePermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
