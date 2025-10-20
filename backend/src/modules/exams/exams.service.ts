import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Exam, ExamDocument } from '../../database/schemas/exam.schema';
import {
  Question,
  QuestionDocument,
} from '../../database/schemas/question.schema';
import { Course, CourseDocument } from '../../database/schemas/course.schema';
import {
  CreateExamDto,
  CreateExamQuestionDto,
  ExamStatus,
} from './dto/create-exam.dto';
import { ExamResponseDto, JoinExamResponseDto } from './dto/exam-response.dto';
import { ExamSummaryDto } from './dto/exam-summary.dto';
import { IUser } from '../../common/interfaces';
import { generatePrefixedPublicId } from '../../common/utils/public-id.util';

import { UserDocument } from '../../database/schemas/user.schema';
import { JoinExamDto } from './dto/join-exam.dto';
import { log } from 'console';

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectConnection()
    private readonly connection: Connection,

    // @InjectModel(Enrollment.name)
    // private enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async createExam(
    createExamDto: CreateExamDto,
    teacher: IUser,
  ): Promise<ExamResponseDto> {
    if (!teacher?.id) {
      throw new ForbiddenException('Missing teacher context');
    }

    if (!Types.ObjectId.isValid(teacher.id)) {
      throw new ForbiddenException('Invalid teacher identifier');
    }

    const startTime = new Date(createExamDto.startTime);
    const endTime = new Date(createExamDto.endTime);

    this.ensureValidDates(startTime, endTime);
    this.ensureDurationWithinWindow(
      startTime,
      endTime,
      createExamDto.durationMinutes,
    );

    if (!Types.ObjectId.isValid(createExamDto.courseId)) {
      throw new BadRequestException('Invalid courseId');
    }

    const courseObjectId = new Types.ObjectId(createExamDto.courseId);

    const course = await this.courseModel.findById(courseObjectId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (String(course.teacherId) !== teacher.id) {
      throw new ForbiddenException(
        'You can only create exams for your courses',
      );
    }

    const teacherObjectId = new Types.ObjectId(teacher.id);
    const normalizedQuestions = createExamDto.questions.map(
      (questionDto, index) =>
        this.buildQuestionPayload(
          questionDto,
          courseObjectId,
          teacherObjectId,
          index,
        ),
    );

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const publicId = await generatePrefixedPublicId('E', this.examModel);
      const createdQuestions = await this.questionModel.insertMany(
        normalizedQuestions,
        { session },
      );

      const questionIds = createdQuestions.map((doc) => doc._id);

      const [examDoc] = await this.examModel.create(
        [
          {
            publicId,
            title: createExamDto.title,
            durationMinutes: createExamDto.durationMinutes,
            startTime,
            endTime,
            status: createExamDto.status ?? ExamStatus.Draft,
            courseId: courseObjectId,
            questions: questionIds,
            rateScore: createExamDto.rateScore,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return this.mapExamResponse(examDoc, createdQuestions);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async listExamSummaries(): Promise<ExamSummaryDto[]> {
    const now = new Date();

    const exams = await this.examModel
      .find({}, { publicId: 1, startTime: 1, endTime: 1 })
      .sort({ startTime: 1 })
      .exec();

    return exams.map((exam) => ({
      id: String(exam._id),
      publicId: exam.publicId,
      status: this.computeExamStatus(now, exam.startTime, exam.endTime),
      startTime: exam.startTime,
      endTime: exam.endTime,
    }));
  }

  private ensureValidDates(startTime: Date, endTime: Date) {
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Invalid start or end time');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private ensureDurationWithinWindow(
    startTime: Date,
    endTime: Date,
    durationMinutes: number,
  ) {
    if (durationMinutes <= 0) {
      throw new BadRequestException('durationMinutes must be greater than 0');
    }

    const diffInMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 60000,
    );

    if (durationMinutes > diffInMinutes) {
      throw new BadRequestException(
        'durationMinutes cannot exceed the available time window',
      );
    }
  }

  private buildQuestionPayload(
    questionDto: CreateExamQuestionDto,
    courseId: Types.ObjectId,
    teacherId: Types.ObjectId,
    index: number,
  ) {
    const normalizedChoices = this.normalizeChoices(questionDto, index);

    const payload: Partial<Question> = {
      content: questionDto.content,
      answerQuestion: questionDto.answerQuestion,
      answer: normalizedChoices,
      courseId,
      teacherId,
    };

    return payload;
  }

  private normalizeChoices(
    questionDto: CreateExamQuestionDto,
    questionIndex: number,
  ) {
    const correctIndex = questionDto.answerQuestion - 1;

    if (!questionDto.answer[correctIndex]) {
      throw new BadRequestException(
        `answerQuestion must reference one of the provided choices (question #${questionIndex + 1})`,
      );
    }

    return questionDto.answer.map((choice, idx) => ({
      content: choice.content,
      isCorrect: idx === correctIndex,
    }));
  }

  private mapExamResponse(
    exam: ExamDocument,
    questions: QuestionDocument[],
  ): ExamResponseDto {
    return {
      id: String(exam._id),
      publicId: exam.publicId,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      courseId: String(exam.courseId),
      rateScore: exam.rateScore,
      questions: questions.map((question) => ({
        id: String(question._id),
        content: question.content,
        answerQuestion: question.answerQuestion,
        answer: question.answer.map((choice) => ({
          content: choice.content,
          isCorrect: choice.isCorrect,
        })),
      })),
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    };
  }

  private computeExamStatus(
    referenceDate: Date,
    startTime: Date,
    endTime: Date,
  ): 'scheduled' | 'active' | 'completed' {
    if (referenceDate < startTime) {
      return 'scheduled';
    }

    if (referenceDate > endTime) {
      return 'completed';
    }

    return 'active';
  }

  /**
   * Allows a student to join (find and validate) an exam using a public code.
   * @param joinExamDto DTO containing the publicId
   * @param user The authenticated student
   * @returns The validated exam details for the exam card
   */
  async joinExam(
    joinExamDto: JoinExamDto,
    user: UserDocument,
  ): Promise<JoinExamResponseDto> {
    const { publicId } = joinExamDto;
    const studentId = user._id;
    log('Student attempting to join exam:', publicId, 'User ID:', studentId);

    // --- Validation 1: Find the exam and its course ---
    const exam = await this.examModel
      .findOne({ publicId })
      .populate('courseId'); // Populate thông tin của Course

    if (!exam) {
      throw new NotFoundException('Exam with this code not found.');
    }

    // --- Validation 2: Check exam status ---
    if (exam.status !== 'draft') {
      throw new BadRequestException('This exam is not active.');
    }
    if (exam.endTime < new Date()) {
      throw new BadRequestException('This exam has already ended.');
    }

    // // --- Validation 3: Check if student is enrolled in the course ---
    // const enrollment = await this.enrollmentModel.findOne({
    //   studentId: studentId,
    //   courseId: (exam.courseId as unknown as CourseDocument)._id,
    // });

    // if (!enrollment) {
    //   throw new ForbiddenException(
    //     'You are not enrolled in the course required for this exam.',
    //   );
    // }

    // --- Success ---
    return new JoinExamResponseDto(exam);
  }
}
