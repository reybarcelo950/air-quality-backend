import { IsISO8601, IsNumberString, IsOptional } from 'class-validator';

export class QueryAirQualityDto {
  @IsOptional()
  @IsNumberString()
  CO?: string;

  @IsOptional()
  @IsNumberString()
  NO2?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
