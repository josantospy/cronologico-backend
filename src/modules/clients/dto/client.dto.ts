import { IsString, IsOptional, IsUUID, IsArray, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ description: 'UUIDs de las empresas', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  companyIds: string[];

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MaxLength(200)
  nombreCompleto: string;

  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ example: '+1 809 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional({ example: 'RUT' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipoDocumento?: string;

  @ApiPropertyOptional({ example: '12345678-9' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroDocumento?: string;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  companyIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreCompleto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tipoDocumento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroDocumento?: string;
}

export class CreateClientAddressDto {
  @ApiProperty({ example: 'Sede Central' })
  @IsString()
  @MaxLength(100)
  alias: string;

  @ApiProperty({ example: 'Av. 27 de Febrero 123' })
  @IsString()
  @MaxLength(300)
  direccion: string;

  @ApiPropertyOptional({ example: 'Santo Domingo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({ example: '+1 809 555 0000' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  predeterminado?: boolean;
}

export class UpdateClientAddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  alias?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  carrierId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  predeterminado?: boolean;
}
