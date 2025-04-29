import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  console.log('Environment variables loaded:', process.env);
  const app = await NestFactory.create(AppModule);
  console.log('Starting application...');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  const port = process.env.PORT || 3333;
  
  app.enableCors();
  console.log(`Application is running on port ${port}`);
  
  await app.listen(port);

}
bootstrap();