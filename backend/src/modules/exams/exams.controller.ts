import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { ExamSummaryDto } from './dto/exam-summary.dto';
import { ApiResponseDto, ResponseHelper } from '../../common/dto/response.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { IUser } from '../../common/interfaces';
import { JoinExamResponseDto } from './dto/exam-response.dto';
import { JoinExamDto } from './dto/join-exam.dto';
import type { UserDocument } from 'src/database/schemas/user.schema';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @Roles('student', 'teacher', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve exams with their current status' })
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
              status: 'active',
              startTime: '2025-11-12T01:00:00.000Z',
              endTime: '2025-11-12T02:30:00.000Z',
            },
          ],
        },
        message: 'Exams retrieved successfully',
      },
    },
  })
  async listExams(): Promise<ApiResponseDto<{ exams: ExamSummaryDto[] }>> {
    const exams = await this.examsService.listExamSummaries();
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
          enum: ['draft', 'active', 'completed', 'cancelled'],
          example: 'draft',
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
    @CurrentUser() user: UserDocument,
  ): Promise<JoinExamResponseDto> {
    return this.examsService.joinExam(joinExamDto, user);
  }
}
