import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '8000', 10),
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
  ],
}));
