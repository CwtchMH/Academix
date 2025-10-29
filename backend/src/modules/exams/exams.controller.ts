import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamSummaryDto } from './dto/exam-summary.dto';
import { ApiResponseDto, ResponseHelper } from '../../common/dto/response.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { IUser } from '../../common/interfaces';
import {
  ExamResponseDto,
  JoinExamResponseDto,
  TakeExamResponseDto,
} from './dto/exam-response.dto';
import { JoinExamDto } from './dto/join-exam.dto';
import { SubmissionResultDto, SubmitExamDto } from './dto/submission.dto';
import { ExamResultsResponseDto } from './dto/exam-results.dto';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get('teacher/:teacherId')
  @Roles('student', 'teacher', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve exams filtered by teacher ID' })
  @ApiResponse({
    status: 200,
    description: 'Exams retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          exams: [
            {
              id: '652fd6a7e5a69c0012345678',
              publicId: 'E123456',
              status: 'scheduled',
              startTime: '2025-11-12T01:00:00.000Z',
              endTime: '2025-11-12T02:30:00.000Z',
            },
            {
              id: '652fd6a7e5a69c0012345679',
              publicId: 'E123457',
              status: 'active',
              startTime: '2025-10-25T10:00:00.000Z',
              endTime: '2025-10-25T12:00:00.000Z',
            },
          ],
        },
        message: 'Exams retrieved successfully',
      },
    },
  })
  async listExamsByTeacher(
    @Param('teacherId') teacherId: string,
  ): Promise<ApiResponseDto<{ exams: ExamSummaryDto[] }>> {
    const exams = await this.examsService.listExamSummaries(teacherId);
    return ResponseHelper.success({ exams }, 'Exams retrieved successfully');
  }

  @Post()
  @Roles('teacher')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new exam along with its questions' })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  @ApiBody({
    description: 'Payload for creating a new exam with inline questions',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Midterm Exam' },
        durationMinutes: { type: 'number', example: 90 },
        startTime: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-12T01:00:00.000Z',
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-12T02:30:00.000Z',
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'active', 'completed', 'cancelled'],
          example: 'scheduled',
        },
        courseId: {
          type: 'string',
          example: '672f1c3ce5a3de8e3ce041f7',
        },
        rateScore: { type: 'number', example: 70 },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                example: 'What is the capital of France?',
              },
              answerQuestion: { type: 'number', example: 2 },
              answer: {
                type: 'array',
                minItems: 4,
                maxItems: 4,
                items: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      example: 'Paris',
                    },
                  },
                },
                example: [
                  { content: 'London' },
                  { content: 'Paris' },
                  { content: 'Rome' },
                  { content: 'Berlin' },
                ],
              },
            },
          },
          example: [
            {
              content: 'What is the capital of France?',
              answerQuestion: 2,
              answer: [
                { content: 'London' },
                { content: 'Paris' },
                { content: 'Rome' },
                { content: 'Berlin' },
              ],
            },
          ],
        },
      },
      required: [
        'title',
        'durationMinutes',
        'startTime',
        'endTime',
        'courseId',
        'questions',
        'rateScore',
      ],
    },
  })
  async createExam(
    @Body() createExamDto: CreateExamDto,
    @CurrentUser() user: IUser,
  ) {
    const exam = await this.examsService.createExam(createExamDto, user);
    return ResponseHelper.success({ exam }, 'Exam created successfully');
  }

  @Get(':id')
  @Roles('teacher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full exam details including questions and answers',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          exam: {
            id: '652fd6a7e5a69c0012345678',
            publicId: 'E123456',
            title: 'Midterm Exam',
            durationMinutes: 90,
            startTime: '2025-11-12T01:00:00.000Z',
            endTime: '2025-11-12T02:30:00.000Z',
            status: 'scheduled',
            courseId: '672f1c3ce5a3de8e3ce041f7',
            rateScore: 70,
            questions: [
              {
                id: '652fd6a7e5a69c0012345679',
                content: 'What is the capital of France?',
                answerQuestion: 2,
                answer: [
                  { content: 'London', isCorrect: false },
                  { content: 'Paris', isCorrect: true },
                  { content: 'Rome', isCorrect: false },
                  { content: 'Berlin', isCorrect: false },
                ],
              },
            ],
            createdAt: '2025-10-25T10:00:00.000Z',
            updatedAt: '2025-10-25T10:00:00.000Z',
          },
        },
        message: 'Exam retrieved successfully',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view this exam' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamById(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<ApiResponseDto<{ exam: ExamResponseDto }>> {
    const exam = await this.examsService.findExamById(id, user);
    return ResponseHelper.success({ exam }, 'Exam retrieved successfully');
  }

  @Put(':id')
  @Roles('teacher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Update an existing exam with full replacement of metadata and questions',
  })
  @ApiResponse({
    status: 200,
    description: 'Exam updated successfully',
    schema: {
      example: {
        success: true,
        data: {
          exam: {
            id: '652fd6a7e5a69c0012345678',
            publicId: 'E123456',
            title: 'Updated Midterm Exam',
            durationMinutes: 120,
            startTime: '2025-11-12T01:00:00.000Z',
            endTime: '2025-11-12T03:00:00.000Z',
            status: 'scheduled',
            courseId: '672f1c3ce5a3de8e3ce041f7',
            rateScore: 75,
            questions: [
              {
                id: '652fd6a7e5a69c0012345680',
                content: 'What is the capital of Germany?',
                answerQuestion: 4,
                answer: [
                  { content: 'London', isCorrect: false },
                  { content: 'Paris', isCorrect: false },
                  { content: 'Rome', isCorrect: false },
                  { content: 'Berlin', isCorrect: true },
                ],
              },
            ],
            createdAt: '2025-10-25T10:00:00.000Z',
            updatedAt: '2025-10-25T11:00:00.000Z',
          },
        },
        message: 'Exam updated successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data, exam has already started, or exam is completed',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this exam',
  })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  @ApiBody({
    description: 'Complete exam data for replacement',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Midterm Exam' },
        durationMinutes: { type: 'number', example: 120 },
        startTime: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-12T01:00:00.000Z',
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          example: '2025-11-12T03:00:00.000Z',
        },
        status: {
          type: 'string',
          enum: ['scheduled', 'active', 'completed', 'cancelled'],
          example: 'scheduled',
        },
        courseId: {
          type: 'string',
          example: '672f1c3ce5a3de8e3ce041f7',
        },
        rateScore: { type: 'number', example: 75 },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                example: 'What is the capital of Germany?',
              },
              answerQuestion: { type: 'number', example: 4 },
              answer: {
                type: 'array',
                minItems: 4,
                maxItems: 4,
                items: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      example: 'Berlin',
                    },
                  },
                },
                example: [
                  { content: 'London' },
                  { content: 'Paris' },
                  { content: 'Rome' },
                  { content: 'Berlin' },
                ],
              },
            },
          },
        },
      },
      required: [
        'title',
        'durationMinutes',
        'startTime',
        'endTime',
        'courseId',
        'questions',
        'rateScore',
      ],
    },
  })
  async updateExam(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
    @CurrentUser() user: IUser,
  ): Promise<ApiResponseDto<{ exam: ExamResponseDto }>> {
    const exam = await this.examsService.updateExam(id, updateExamDto, user);
    return ResponseHelper.success({ exam }, 'Exam updated successfully');
  }

  @Post('join')
  @Roles('student')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Student joins an exam by code' })
  @ApiResponse({
    status: 200,
    description: 'Exam found and user is authorized.',
    type: JoinExamResponseDto,
  })
  @ApiResponse({ status: 403, description: 'User not enrolled in the course.' })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  async joinExam(
    @Body() joinExamDto: JoinExamDto,
    @CurrentUser() user: IUser,
  ): Promise<JoinExamResponseDto> {
    return this.examsService.joinExam(joinExamDto, user);
  }

  // API get full exam questions for taking (without correct answers)
  @Get(':publicId/take')
  @Roles('student') // Chỉ student
  @ApiOperation({ summary: 'Get full exam questions for taking' })
  @ApiResponse({
    status: 200,
    description: 'Returns the full exam questions (without correct answers).',
    type: TakeExamResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Not enrolled or already submitted.',
  })
  @ApiResponse({ status: 404, description: 'Exam not found.' })
  @ApiResponse({ status: 400, description: 'Exam is not active or has ended.' })
  async getExamForTaking(
    @Param('publicId') publicId: string,
    @CurrentUser() user: IUser,
  ): Promise<TakeExamResponseDto> {
    return this.examsService.getExamForTaking(publicId, user);
  }

  // API ĐỂ NỘP BÀI
  @Post(':publicId/submit')
  @Roles('student')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit answers for an exam' })
  @ApiResponse({
    status: 201,
    description: 'Exam submitted and graded successfully.',
    type: SubmissionResultDto,
  })
  @ApiResponse({ status: 403, description: 'Already submitted.' })
  @ApiResponse({ status: 400, description: 'Exam has ended.' })
  async submitExam(
    @Param('publicId') publicId: string,
    @CurrentUser() user: IUser,
    @Body() submitDto: SubmitExamDto,
  ): Promise<SubmissionResultDto> {
    return this.examsService.submitExam(publicId, user, submitDto);
  }

  @Get(':id/results')
  @Roles('teacher')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get exam results for all students' })
  @ApiResponse({
    status: 200,
    description: 'Exam results retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          exam: {
            title: 'Midterm Exam',
            status: 'completed',
          },
          results: [
            {
              studentId: '652fd6a7e5a69c0012345678',
              studentName: 'Nguyễn Văn A',
              studentCode: 'SV001',
              grade: 85.5,
              maxGrade: 100,
              status: 'pass',
            },
            {
              studentId: '652fd6a7e5a69c0012345679',
              studentName: 'Trần Thị B',
              studentCode: 'SV002',
              grade: 65.0,
              maxGrade: 100,
              status: 'fail',
            },
          ],
        },
        message: 'Exam results retrieved successfully',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Not authorized to view this exam' })
  @ApiResponse({ status: 404, description: 'Exam not found' })
  async getExamResults(
    @Param('id') id: string,
    @CurrentUser() user: IUser,
  ): Promise<ApiResponseDto<ExamResultsResponseDto>> {
    const results = await this.examsService.getExamResults(id, user);
    return ResponseHelper.success(
      results,
      'Exam results retrieved successfully',
    );
  }
}
