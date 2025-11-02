import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Course, CourseSchema } from '../../database/schemas/course.schema';
import { Exam, ExamSchema } from '../../database/schemas/exam.schema';
import {
  Enrollment,
  EnrollmentSchema,
} from '../../database/schemas/enrollment.schema';
import {
  Submission,
  SubmissionSchema,
} from '../../database/schemas/submission.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
