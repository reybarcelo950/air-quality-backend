import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { AirQuality } from './schemas/air-quality.schema';
import { QueryAirQualityDto } from './dto/query-air-quality.dto';

const parseNumber = (value: string): number | null => {
  if (!value) return null;
  const normalized = value.replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? null : n;
};

const parseDate = (d: string) => {
  if (!d) return null;
  const [day, month, year] = d.split('/');
  return new Date(Number(year), Number(month) - 1, Number(day)); // mes 0-based
};

@Injectable()
export class AirQualityService {
  constructor(
    @InjectModel(AirQuality.name) private readonly aqModel: Model<AirQuality>,
  ) {}

  async importCsv(filePath: string, batchSize = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      const batch: Partial<AirQuality>[] = [];
      const stream = fs
        .createReadStream(filePath)
        .pipe(csv.parse({ headers: true, ignoreEmpty: true, delimiter: ';' }));

      stream.on('error', (error) => reject(error));

      stream.on('data', async (row: Record<string, string>) => {
        const value = {
          Time: row['Time'],
          Date: parseDate(row['Date']),
          C6H6: parseNumber(row['C6H6(GT)']),
          PT08S1: parseNumber(row['PT08.S1(CO)']),
          PT08S2: parseNumber(row['PT08.S2(NMHC)']),
          PT08S3: parseNumber(row['PT08.S3(NOx)']),
          PT08S4: parseNumber(row['PT08.S4(NO2)']),
          PT08S5: parseNumber(row['PT08.S5(O3)']),
          RH: parseNumber(row['RH']),
          CO: parseNumber(row['CO(GT)']),
          NO2: parseNumber(row['NO2(GT)']),
          T: parseNumber(row['T']),
          AH: parseNumber(row['AH']),
          NOx: parseNumber(row['NOx(GT)']),
          NMHC: parseNumber(row['NMHC(GT)']),
        };
        batch.push(value);

        if (batch.length >= batchSize) {
          stream.pause();
          try {
            await this.aqModel.insertMany(batch, { ordered: false });
            console.error('insert batch', batch.length);
            batch.length = 0;
          } catch (e) {
            console.error('insert batch error', e);
          }
          stream.resume();
        }
      });

      stream.on('end', () => {
        const flushRemaining = async () => {
          if (batch.length) {
            await this.aqModel.insertMany(batch, { ordered: false });
          }
          resolve();
        };
        flushRemaining().catch((err) => reject(err as Error));
      });
    });
  }

  async findAll(query: QueryAirQualityDto): Promise<AirQuality[]> {
    const filter: any = {};

    if (query.CO) filter.CO = +query.CO;
    if (query.NO2) filter.NO2 = +query.NO2;

    if (query.dateFrom || query.dateTo) {
      filter.Date = {};
      if (query.dateFrom) filter.Date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filter.Date.$lte = new Date(query.dateTo);
    }

    return this.aqModel.find(filter).sort({ Date: 1 }).exec();
  }
}
