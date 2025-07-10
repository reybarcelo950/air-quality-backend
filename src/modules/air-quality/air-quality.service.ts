import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { AirQuality } from './schemas/air-quality.schema';
import { QueryAirQualityDto } from './dto/query-air-quality.dto';
import { DATE_FORMAT, INTERVAL, toMongoDateQuery } from './utils';

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

const parseTime = (t?: string): [number, number, number] => {
  const parts = (t || '00:00:00')
    .replace(/:/g, '.')
    .split('.')
    .map((n) => parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
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

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      stream.on('data', async (row: Record<string, string>) => {
        const dateObj = parseDate(row['Date']);
        const [h, m, s] = parseTime(row['Time']);
        // to include on the Date the time
        dateObj.setHours(h, m, s);

        const value = {
          Time: row['Time'],
          Date: dateObj,
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
    return this.aqModel.find(query).sort({ Date: 1 }).exec();
  }

  /**
   * Returns a time series for a specific parameter within an optional date range.
   * @param parameter Field name (e.g., CO, C6H6)
   * @param from Start date (ISO string)
   * @param to End date (ISO string)
   * @param interval format of the Date result
   */
  async getTimeSeries(
    parameter: keyof AirQuality,
    from?: string,
    to?: string,
    interval: INTERVAL = INTERVAL.daily,
  ): Promise<any[]> {
    let filter: FilterQuery<AirQuality> = {};
    if (from || to) {
      filter = toMongoDateQuery('Date', from, to);
    }

    const dateTrunc = {
      $dateToString: { format: DATE_FORMAT[interval], date: '$Date' },
    };

    const aggregation: PipelineStage[] = [
      {
        $match: filter,
      },
      {
        $group: {
          _id: dateTrunc,
          [parameter]: { $sum: `$${parameter}` },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          interval: '$_id',
          count: 1,
          [parameter]: 1,
        },
      },
    ];

    return this.aqModel.aggregate(aggregation).allowDiskUse(true).exec();
  }

  getValidParameters(): (keyof AirQuality)[] {
    return Object.keys(this.aqModel.schema.paths).filter(
      (key) =>
        !['_id', '__v', 'Date', 'Time', 'createdAt', 'updatedAt'].includes(key),
    ) as (keyof AirQuality)[];
  }

  async getAverageForFields(
    operator: string = 'avg',
    from?: string,
    to?: string,
  ): Promise<any> {
    let filter: FilterQuery<AirQuality> = {};
    if (from || to) {
      filter = toMongoDateQuery('Date', from, to);
    }

    // get the fields to make the average stats
    const validParams = this.getValidParameters() as string[];
    const projectFields = validParams.reduce<Record<string, any>>(
      (fields, param) => {
        fields[param] = { [`$${operator}`]: `$${param}` };
        return fields;
      },
      {},
    );

    const aggregation: PipelineStage[] = [
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,
          ...projectFields,
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          ...projectFields,
        },
      },
    ];
    const result = await this.aqModel
      .aggregate(aggregation)
      .allowDiskUse(true)
      .exec();

    return result?.[0] || {};
  }
}
