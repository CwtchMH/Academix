import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Certificate,
  CertificateSchema,
} from '../../database/schemas/certificate.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import {
  Submission,
  SubmissionSchema,
} from '../../database/schemas/submission.schema';
import { Exam, ExamSchema } from '../../database/schemas/exam.schema';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { BlockchainService } from '../../common/services/blockchain.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Certificate.name, schema: CertificateSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
  ],
  controllers: [CertificateController],
  providers: [CertificateService, BlockchainService],
  exports: [CertificateService],
})
export class CertificateModule {}
