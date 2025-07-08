import { IsISO8601, IsNumberString, IsOptional } from 'class-validator';

export class QueryAirQualityDto {
  @IsOptional()
  @IsNumberString()
  CO?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
