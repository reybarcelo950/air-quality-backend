import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AirQuality } from './schemas/air-quality.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class AirQualityGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AirQualityGateway.name);
  private intervalId: any;

  afterInit() {
    this.logger.log('AirQuality Gateway initialized');
    this.startMockEmission();
  }

  handleConnection(client: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private generateMockData(): Partial<AirQuality> {
    const random = (min: number, max: number) =>
      Math.round((Math.random() * (max - min) + min) * 100) / 100;

    const maybeNull = <T>(value: T): T | null =>
      Math.random() < 0.1 ? null : value;

    const now = new Date();

    return {
      Date: now,
      Time: now.toTimeString().split(' ')[0],
      CO: maybeNull(random(-2, 10)),
      PT08S1: maybeNull(random(50, 500)),
      NMHC: maybeNull(random(-50, 200)),
      C6H6: maybeNull(random(0, 50)),
      PT08S2: maybeNull(random(50, 500)),
      NOx: maybeNull(random(-10, 100)),
      PT08S3: maybeNull(random(50, 500)),
      NO2: maybeNull(random(-10, 100)),
      PT08S4: maybeNull(random(50, 500)),
      PT08S5: maybeNull(random(50, 500)),
      T: maybeNull(random(-5, 40)),
      RH: maybeNull(random(0, 100)),
      AH: maybeNull(random(0, 2)),
    };
  }

  private startMockEmission() {
    this.intervalId = setInterval(() => {
      const mockData = this.generateMockData();
      this.server.emit('AIR_QUALITY_UPDATE', mockData);
    }, 1000);
  }
}
