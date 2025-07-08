import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AirQuality extends Document {
  @Prop({ type: Date, index: true, required: true })
  Date: Date;

  @Prop({ type: String, index: true, required: true })
  Time: string;

  @Prop({ type: Number, index: true, required: true })
  CO: number;

  @Prop({ type: Number, index: true, required: true })
  PT08S1: number;

  @Prop({ type: Number, index: true, required: true })
  NMHC: number;

  @Prop({ type: Number, index: true, required: true })
  C6H6: number;

  @Prop({ type: Number, index: true, required: true })
  PT08S2: number;

  @Prop({ type: Number, index: true, required: true })
  NOx: number;

  @Prop({ type: Number, index: true, required: true })
  PT08S3: number;

  @Prop({ type: Number, index: true, required: true })
  NO2: number;

  @Prop({ type: Number, index: true, required: true })
  PT08S4: number;

  @Prop({ type: Number, index: true, required: true })
  PT08S5: number;

  @Prop({ type: Number, index: true, required: true })
  T: number;

  @Prop({ type: Number, index: true, required: true })
  RH: number;

  @Prop({ type: Number, index: true, required: true })
  AH: number;
}

export const AirQualitySchema = SchemaFactory.createForClass(AirQuality);

AirQualitySchema.index({ Date: 1, Time: 1 });
