import {
  BadRequestException, Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AirQualityService } from './air-quality.service';
import { QueryAirQualityDto } from './dto/query-air-quality.dto';

@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly aqService: AirQualityService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => cb(null, file.originalname),
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(csv)$/)) {
          return cb(new BadRequestException('only CSV allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 1024 * 1024 },
    }),
  )
  async importFile(@UploadedFile() file: Express.Multer.File) {
    await this.aqService.importCsv(file.path);
    return { message: 'Information loaded successfully' };
  }

  @Post('search')
  async search(@Body() options: QueryAirQualityDto) {
    return this.aqService.findAll(options);
  }
}
