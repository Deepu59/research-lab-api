import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRunDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { speed: 1.2, voltage: 7.4 },
  })
  @IsObject()
  measurements: Record<string, number>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { pwm: 200 },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'Battery was fully charged' })
  @IsOptional()
  @IsString()
  notes?: string;
}
