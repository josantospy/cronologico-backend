import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceDto {
  @ApiProperty({ example: '001-001' })
  @IsString()
  numeroFactura: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaEmision?: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoTotal?: number;

  @ApiPropertyOptional({ enum: InvoiceStatus, example: InvoiceStatus.PENDIENTE })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  estado?: InvoiceStatus;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoTotal?: number;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  estado?: InvoiceStatus;
}
