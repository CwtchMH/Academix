export interface ExamChoiceResponseDto {
  content: string;
  isCorrect: boolean;
}

export interface ExamQuestionResponseDto {
  id: string;
  content: string;
  answerQuestion: number;
  answer: ExamChoiceResponseDto[];
}

export interface ExamResponseDto {
  id: string;
  publicId: string;
  title: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  status: string;
  courseId: string;
  rateScore: number;
  questions: ExamQuestionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import  { CourseDocument } from '../../../database/schemas/course.schema';

class CourseInfoForJoinDto {
  @ApiProperty({ example: 'C123456' })
  publicId: string;

  @ApiProperty({ example: 'Introduction to Computer Science' })
  courseName: string;
}

/**
 * DTO response cho API "Join Exam",
 * chỉ chứa thông tin cần thiết cho ExamCard.
 */
export class JoinExamResponseDto {
  @ApiProperty({ example: 'E123456' })
  publicId: string;

  @ApiProperty({ example: 'Final Exam' })
  title: string;

  @ApiProperty({ example: 90 })
  durationMinutes: number;

  @ApiProperty({ example: '2025-12-25T10:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ type: CourseInfoForJoinDto })
  course: CourseInfoForJoinDto;

  constructor(exam: any) {
    // 'exam' là object đã được populate('courseId')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const course = exam.courseId as CourseDocument;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.publicId = exam.publicId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.title = exam.title;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.durationMinutes = exam.durationMinutes;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.startTime = exam.startTime;
    this.course = {
      publicId: course?.publicId || 'N/A',
      courseName: course?.courseName || 'N/A',
    };
  }
}
