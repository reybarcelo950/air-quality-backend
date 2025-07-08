import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AirQualityModule } from './air-quality.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/airquality',
      {
        onConnectionCreate: () =>
          console.log(`connected to ${process.env.MONGO_URI}`),
      },
    ),
    AirQualityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
