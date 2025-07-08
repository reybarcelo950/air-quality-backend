import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ limit: '1mb', extended: true }));

  await app.listen(3000);
}

bootstrap().catch((e) => console.log(e));
