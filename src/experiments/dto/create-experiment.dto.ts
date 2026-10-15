import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateExperimentDto {
  @ApiProperty({ example: 'Motor speed vs battery voltage' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Speed drops as battery voltage falls' })
  @IsOptional()
  @IsString()
  hypothesis?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { motor: 'BO', surface: 'wood' },
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}
