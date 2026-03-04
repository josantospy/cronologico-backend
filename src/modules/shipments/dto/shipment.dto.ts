import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShipmentPackerDto {
  @ApiProperty({ description: 'UUID del usuario empacador' })
  @IsString()
  empacadorId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  cantidadPaquetes: number;
}

export class CreateShipmentDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Números de factura separados por coma' })
  @IsOptional()
  @IsString()
  numerosFactura?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fragil?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comentariosGenerales?: string;

  @ApiProperty({ type: [ShipmentPackerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentPackerDto)
  packers: ShipmentPackerDto[];
}

export class UpdateShipmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carrierId?: string | null;

  @ApiPropertyOptional({ description: 'Números de factura separados por coma' })
  @IsOptional()
  @IsString()
  numerosFactura?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fragil?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comentariosGenerales?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ type: [ShipmentPackerDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentPackerDto)
  packers?: ShipmentPackerDto[];
}

export class GenerateConduceDto {
  @ApiProperty({ type: [String], description: 'IDs de los envíos a despachar' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class AddShipmentPackerDto {
  @ApiProperty()
  @IsString()
  empacadorId: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  cantidadPaquetes: number;
}
