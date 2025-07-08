import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AirQualityService } from './air-quality.service';
import { toMongoDateQuery } from './utils';
import { AirQuality } from './schemas/air-quality.schema';

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

  /**
   * Fetch data within a specific date range
   */
  @Get('range')
  async getByDateRange(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) {
      throw new BadRequestException('from y to are required fields');
    }
    return this.aqService.findAll(toMongoDateQuery('Date', from, to));
  }

  /**
   * Time series of a specific parameter
   */
  @Get('timeline/:parameter')
  async getTimeSeries(
    @Param('parameter') parameter: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const validParams = this.aqService.getValidParameters() as string[];
    if (!validParams.includes(parameter)) {
      throw new BadRequestException(`invalid parameter: ${parameter}`);
    }
    return this.aqService.getTimeSeries(
      parameter as keyof AirQuality,
      from,
      to,
    );
  }

  /**
   * Time series of a specific parameter
   */
  @Get('average')
  async getAverage(@Query('from') from?: string, @Query('to') to?: string) {
    return this.aqService.getAverageForFields(from, to);
  }
}
