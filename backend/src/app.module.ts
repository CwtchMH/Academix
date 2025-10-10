import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CertificateModule } from './modules/certificates/certificate.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Import all schemas for seeding
import { User, UserSchema } from './database/schemas/user.schema';
import { Course, CourseSchema } from './database/schemas/course.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from './database/schemas/enrollment.schema';
import { Question, QuestionSchema } from './database/schemas/question.schema';
import { Exam, ExamSchema } from './database/schemas/exam.schema';
import {
  Submission,
  SubmissionSchema,
} from './database/schemas/submission.schema';
import {
  Certificate,
  CertificateSchema,
} from './database/schemas/certificate.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }),
      inject: [ConfigService],
    }),
    // Register all schemas for seeding
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: Certificate.name, schema: CertificateSchema },
    ]),
    AuthModule,
    HealthModule,
    CertificateModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
