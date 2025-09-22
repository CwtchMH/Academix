import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.enableCors({
    origin: configService.get<string[]>('app.corsOrigins') || [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(configService.get<string>('app.apiPrefix') || 'api/v1');

  // Global pipes and filters
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('EduChain Block API')
    .setDescription(
      'Transparent online examination platform with AI-driven anti-cheating and blockchain-issued immutable certificates',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Health', 'API health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('app.port') || 8000;
  await app.listen(port);

  console.log(`🚀 EduChain Block API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(
    `🌍 Environment: ${configService.get<string>('app.environment')}`,
  );
}

void bootstrap();
