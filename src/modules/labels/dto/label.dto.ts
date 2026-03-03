import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateLabelDto {
  @ApiProperty()
  @IsString()
  shipmentId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  quantity: number;
}
