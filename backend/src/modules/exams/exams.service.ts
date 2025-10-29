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
import { CreateExamDto, CreateExamQuestionDto } from './dto/create-exam.dto';
import { UpdateExamDto, UpdateExamQuestionDto } from './dto/update-exam.dto';
import {
  ExamResponseDto,
  JoinExamResponseDto,
  TakeExamResponseDto,
  ExamWithPopulatedQuestions,
  ExamWithPopulatedRelations,
} from './dto/exam-response.dto';
import { ExamSummaryDto } from './dto/exam-summary.dto';
import { IUser } from '../../common/interfaces';
import { generatePrefixedPublicId } from '../../common/utils/public-id.util';
import { computeExamStatus } from '../../common/utils/exam.util';

import { JoinExamDto } from './dto/join-exam.dto';
import { log } from 'console';
import {
  Submission,
  SubmissionDocument,
} from 'src/database/schemas/submission.schema';
import { SubmitExamDto, SubmissionResultDto } from './dto/submission.dto';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { ExamResultsResponseDto, ExamResultDto } from './dto/exam-results.dto';

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
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
            status: createExamDto.status ?? 'scheduled',
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

  async listExamSummaries(teacherId?: string): Promise<ExamSummaryDto[]> {
    const now = new Date();

    let query = {};

    // If teacherId is provided, filter exams by courses owned by that teacher
    if (teacherId) {
      if (!Types.ObjectId.isValid(teacherId)) {
        throw new BadRequestException('Invalid teacher ID');
      }

      // Find all courses owned by this teacher
      const courses = await this.courseModel
        .find({ teacherId: new Types.ObjectId(teacherId) })
        .select('_id')
        .exec();

      const courseIds = courses.map((course) => course._id);

      // Filter exams by these course IDs
      query = { courseId: { $in: courseIds } };
    }

    const exams = await this.examModel
      .find(query, { publicId: 1, startTime: 1, endTime: 1, status: 1 })
      .sort({ startTime: 1 })
      .exec();

    return exams.map((exam) => ({
      id: String(exam._id),
      publicId: exam.publicId,
      status: computeExamStatus(now, exam.startTime, exam.endTime, exam.status),
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

  private buildQuestionPayloadFromUpdate(
    questionDto: UpdateExamQuestionDto,
    courseId: Types.ObjectId,
    teacherId: Types.ObjectId,
    index: number,
  ) {
    const normalizedChoices = this.normalizeChoicesFromUpdate(
      questionDto,
      index,
    );

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

  private normalizeChoicesFromUpdate(
    questionDto: UpdateExamQuestionDto,
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

  /**
   * Fetch full exam details including all questions and answers.
   * @param examId The MongoDB ObjectId of the exam
   * @param teacher The authenticated teacher
   * @returns The complete exam with questions
   */
  async findExamById(examId: string, teacher: IUser): Promise<ExamResponseDto> {
    if (!Types.ObjectId.isValid(examId)) {
      throw new BadRequestException('Invalid exam ID');
    }

    const exam = await this.examModel.findById(examId).exec();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Verify course ownership
    const course = await this.courseModel.findById(exam.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (String(course.teacherId) !== teacher.id) {
      throw new ForbiddenException('You can only view exams for your courses');
    }

    // Load all questions
    const questions = await this.questionModel
      .find({ _id: { $in: exam.questions } })
      .exec();

    return this.mapExamResponse(exam, questions);
  }

  /**
   * Update an existing exam with full replacement of metadata and questions.
   * @param examId The MongoDB ObjectId of the exam
   * @param updateExamDto Complete updated exam data
   * @param teacher The authenticated teacher
   * @returns The updated exam with questions
   */
  async updateExam(
    examId: string,
    updateExamDto: UpdateExamDto,
    teacher: IUser,
  ): Promise<ExamResponseDto> {
    if (!teacher?.id) {
      throw new ForbiddenException('Missing teacher context');
    }

    if (!Types.ObjectId.isValid(teacher.id)) {
      throw new ForbiddenException('Invalid teacher identifier');
    }

    if (!Types.ObjectId.isValid(examId)) {
      throw new BadRequestException('Invalid exam ID');
    }

    // Find existing exam
    const existingExam = await this.examModel.findById(examId).exec();
    if (!existingExam) {
      throw new NotFoundException('Exam not found');
    }

    // Validate dates
    const startTime = new Date(updateExamDto.startTime);
    const endTime = new Date(updateExamDto.endTime);

    this.ensureValidDates(startTime, endTime);
    this.ensureDurationWithinWindow(
      startTime,
      endTime,
      updateExamDto.durationMinutes,
    );

    // Validate courseId
    if (!Types.ObjectId.isValid(updateExamDto.courseId)) {
      throw new BadRequestException('Invalid courseId');
    }

    const courseObjectId = new Types.ObjectId(updateExamDto.courseId);
    const course = await this.courseModel.findById(courseObjectId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (String(course.teacherId) !== teacher.id) {
      throw new ForbiddenException(
        'You can only update exams for your courses',
      );
    }

    // Check if exam can be updated - only allow if not started yet or cancelled
    const now = new Date();
    const hasStarted = now >= existingExam.startTime;
    const isCompleted = existingExam.status === 'completed';

    if (isCompleted) {
      throw new BadRequestException('Cannot update completed exams');
    }

    if (hasStarted && existingExam.status !== 'cancelled') {
      throw new BadRequestException(
        'Cannot update exam that has already started',
      );
    }

    const teacherObjectId = new Types.ObjectId(teacher.id);
    const normalizedQuestions = updateExamDto.questions.map(
      (questionDto, index) =>
        this.buildQuestionPayloadFromUpdate(
          questionDto,
          courseObjectId,
          teacherObjectId,
          index,
        ),
    );

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Delete old questions
      await this.questionModel.deleteMany(
        { _id: { $in: existingExam.questions } },
        { session },
      );

      // Create new questions
      const createdQuestions = await this.questionModel.insertMany(
        normalizedQuestions,
        { session },
      );

      const questionIds = createdQuestions.map((doc) => doc._id);

      // Update exam
      const updatedExam = await this.examModel.findByIdAndUpdate(
        examId,
        {
          title: updateExamDto.title,
          durationMinutes: updateExamDto.durationMinutes,
          startTime,
          endTime,
          status: updateExamDto.status ?? 'scheduled',
          courseId: courseObjectId,
          questions: questionIds,
          rateScore: updateExamDto.rateScore,
          updatedAt: new Date(),
        },
        { session, new: true },
      );

      if (!updatedExam) {
        throw new NotFoundException('Exam not found during update');
      }

      await session.commitTransaction();

      return this.mapExamResponse(updatedExam, createdQuestions);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Allows a student to join (find and validate) an exam using a public code.
   * @param joinExamDto DTO containing the publicId
   * @param user The authenticated student
   * @returns The validated exam details for the exam card
   */
  async joinExam(
    joinExamDto: JoinExamDto,
    user: IUser,
  ): Promise<JoinExamResponseDto> {
    const { publicId } = joinExamDto;
    const studentId = user.id;
    log('Student attempting to join exam:', publicId, 'User ID:', studentId);

    // --- Validation 1: Find the exam and its course ---
    const exam = await this.examModel
      .findOne({ publicId })
      .populate('courseId'); // Populate thông tin của Course

    if (!exam) {
      throw new NotFoundException('Exam with this code not found.');
    }

    // --- Validation 2: Check exam status ---
    if (exam.status !== 'scheduled') {
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

  /**
   * Get full exam details for a student to start taking it.
   * This performs all necessary validations.
   * @param publicId The exam's public ID
   * @param user The authenticated student
   * @returns The sanitized exam data (no correct answers)
   */
  async getExamForTaking(
    publicId: string,
    user: IUser,
  ): Promise<TakeExamResponseDto> {
    const studentId = user.id;

    // --- Validation 1: Find exam, populate course and questions ---
    const examResult = await this.examModel
      .findOne({ publicId })
      .populate('courseId') // Lấy thông tin course
      .populate('questions') // ⭐️ Lấy toàn bộ câu hỏi
      .exec();

    if (!examResult) {
      throw new NotFoundException('Exam not found.');
    }

    // Type assertion: exam đã được populate('questions') nên questions là QuestionDocument[]
    const exam = examResult as unknown as ExamWithPopulatedQuestions;

    // --- Validation 2: Check Time & Status ---
    if (exam.status !== 'scheduled') {
      throw new BadRequestException('This exam is not active.');
    }
    const now = new Date();
    if (now < exam.startTime) {
      throw new BadRequestException('This exam has not started yet.');
    }
    if (now > exam.endTime) {
      throw new BadRequestException('This exam has already ended.');
    }

    // --- Validation 3: Check Enrollment (Student đã đăng ký course?) ---
    // const enrollment = await this.enrollmentModel.findOne({
    //   studentId: studentId,
    //   courseId: (exam.courseId as CourseDocument)._id,
    // });

    // if (!enrollment) {
    //   throw new ForbiddenException(
    //     'You are not enrolled in the course for this exam.',
    //   );
    // }

    // --- Validation 4: Check Previous Submission (Đã nộp bài chưa?) ---
    // Index unique (studentId, examId) sẽ xử lý việc này hiệu quả
    const existingSubmission = await this.submissionModel.findOne({
      studentId: studentId,
      examId: exam._id,
    });

    if (existingSubmission) {
      throw new ForbiddenException('You have already submitted this exam.');
    }

    // Type assertion: exam đã được populate('questions') nên questions là QuestionDocument[]
    return new TakeExamResponseDto(exam);
  }

  /**
   * Submits a student's answers for an exam, calculates the score,
   * and saves the submission.
   * @param publicId The exam's public ID
   * @param user The authenticated student
   * @param submitDto The student's answers
   * @returns The detailed exam result
   */
  async submitExam(
    publicId: string,
    user: IUser,
    submitDto: SubmitExamDto,
  ): Promise<SubmissionResultDto> {
    const studentId = user.id;

    // Find exam (lần này populate cả 'questions' VÀ 'courseId')
    const examResult = await this.examModel
      .findOne({ publicId })
      .populate('questions')
      .populate('courseId');

    if (!examResult) {
      throw new NotFoundException('Exam not found.');
    }

    // Type assertion: exam đã được populate cả 'questions' và 'courseId'
    const exam = examResult as unknown as ExamWithPopulatedRelations;
    const examId = exam._id;

    // Check time (không cho nộp bài khi đã hết giờ)
    if (new Date() > exam.endTime) {
      throw new BadRequestException('The time for this exam has ended.');
    }

    // Check for existing submission
    const existingSubmission = await this.submissionModel.findOne({
      studentId,
      examId,
    });

    if (existingSubmission) {
      throw new ForbiddenException('You have already submitted this exam.');
    }

    // Chấm điểm (Grading) - type-safe vì đã dùng ExamWithPopulatedRelations
    const questions = exam.questions;
    let correctCount = 0;

    // Tạo một Map để tra cứu câu trả lời của student O(1)
    const answerMap = new Map(
      submitDto.answers.map((ans) => [ans.questionId, ans.answerNumber]),
    );

    for (const question of questions) {
      const questionId = (question._id as Types.ObjectId).toHexString();
      const studentAnswerNumber = answerMap.get(questionId);
      // Giả định: `question.answerQuestion` là nguồn tin cậy (1-4)
      if (studentAnswerNumber === question.answerQuestion) {
        correctCount++;
      }
    }

    const totalQuestions = questions.length;
    const percentageScore =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Lưu Submission vào DB ---
    const submissionDate = new Date();

    // Convert DTO answers to Schema answers
    const submissionAnswers = submitDto.answers.map((ans) => ({
      questionId: new Types.ObjectId(ans.questionId),
      answerNumber: ans.answerNumber,
    }));

    const newSubmission = new this.submissionModel({
      studentId,
      examId,
      score: percentageScore,
      status: 'graded', // Tự động 'graded' vì đã chấm điểm
      submittedAt: submissionDate,
      answers: submissionAnswers,
    });

    await newSubmission.save(); // Lỗi unique index (nộp 2 lần) sẽ được bắt ở đây

    // Tạo Response DTO - type-safe vì exam.courseId đã được populate
    const course = exam.courseId;

    return {
      examTitle: exam.title,
      courseName: course.courseName,
      dateTaken: submissionDate,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      score: percentageScore,
      result: percentageScore >= exam.rateScore ? 'Passed' : 'Failed',
      // ✅ Cast _id về Types.ObjectId trước khi convert sang string
      submissionId: (newSubmission._id as Types.ObjectId).toHexString(),
    };
  }

  /**
   * Lấy kết quả thi của tất cả học sinh cho một exam
   * @param examId The MongoDB ObjectId of the exam
   * @param teacher The authenticated teacher
   * @returns Danh sách kết quả thi của các học sinh
   */
  async getExamResults(
    examId: string,
    teacher: IUser,
  ): Promise<ExamResultsResponseDto> {
    if (!Types.ObjectId.isValid(examId)) {
      throw new BadRequestException('Invalid exam ID');
    }

    // Tìm exam và verify ownership
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Verify course ownership
    const course = await this.courseModel.findById(exam.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (String(course.teacherId) !== teacher.id) {
      throw new ForbiddenException(
        'You can only view results for exams in your courses',
      );
    }

    // Lấy tất cả submissions cho exam này và populate thông tin student
    const examObjectId = exam._id as Types.ObjectId;

    const submissions = await this.submissionModel
      .find({ examId: examObjectId, status: 'graded' })
      .populate('studentId', 'fullName username')
      .sort({ score: -1 }) // Sắp xếp theo điểm giảm dần
      .exec();
    // Tính toán status của exam (scheduled/active/completed)
    const now = new Date();
    const examStatus = computeExamStatus(
      now,
      exam.startTime,
      exam.endTime,
      exam.status,
    );

    // Map submissions thành ExamResultDto
    const results: ExamResultDto[] = [];

    for (const submission of submissions) {
      // studentId có thể đã được populate thành UserDocument hoặc vẫn là ObjectId
      let student: UserDocument | null = null;
      let studentIdStr: string;

      if (submission.studentId instanceof Types.ObjectId) {
        // Chưa được populate, cần query lại
        student = await this.userModel.findById(submission.studentId).exec();
        studentIdStr = submission.studentId.toHexString();
      } else {
        // Đã được populate
        student = submission.studentId as unknown as UserDocument;
        studentIdStr = (student._id as Types.ObjectId).toHexString();
      }

      if (!student || !student.username) {
        // Bỏ qua nếu không tìm thấy student hoặc không có username
        continue;
      }

      const grade = submission.score; // Điểm số (0-100)
      const maxGrade = 100; // Điểm tối đa luôn là 100 vì score là percentage
      const status: 'pass' | 'fail' = grade >= exam.rateScore ? 'pass' : 'fail';

      // Sử dụng fullName nếu có, nếu không thì fallback sang username
      // (Một số tài khoản cũ có thể không có fullName)
      const studentName = student.fullName?.trim() || student.username;

      results.push({
        studentId: studentIdStr,
        studentName,
        studentCode: studentIdStr,
        grade,
        maxGrade,
        status,
      });
    }

    return {
      exam: {
        title: exam.title,
        status: examStatus,
      },
      results,
    };
  }
}
