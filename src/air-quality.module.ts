import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AirQuality, AirQualitySchema } from './schemas/air-quality.schema';
import { AirQualityService } from './air-quality.service';
import { AirQualityController } from './air-quality.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AirQuality.name, schema: AirQualitySchema },
    ]),
  ],
  providers: [AirQualityService],
  controllers: [AirQualityController],
})
export class AirQualityModule {}
