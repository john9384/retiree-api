import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app/app.module';
import { GlobalExceptionFilter } from 'library/middleware/global-exception-filter';
import { config } from 'config/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [config.frontendBase],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
