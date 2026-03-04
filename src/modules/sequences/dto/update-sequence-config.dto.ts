import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ResetPeriod } from '../entities/sequence-config.entity';

export class UpdateSequenceConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  prefijo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  separador?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  longitudSecuencia?: number;

  @IsOptional()
  @IsEnum(ResetPeriod)
  periodoReinicio?: ResetPeriod;
}
