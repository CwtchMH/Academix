import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateBasicCourseDto } from './dto/course.dto';
import { ResponseHelper } from '../../common/dto/response.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course (teachers only)' })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    schema: {
      example: {
        success: true,
        data: {
          course: {
            id: '652fd6a7e5a69c0012345678',
            courseName: 'Algebra Basics',
            teacherId: '652fd6a7e5a69c0012344321',
            enrollmentCount: 0,
            createdAt: '2025-10-11T04:20:31.123Z',
            updatedAt: '2025-10-11T04:20:31.123Z',
          },
        },
        message: 'Course created successfully',
      },
    },
  })
  async createCourse(@Body() createCourseDto: CreateBasicCourseDto) {
    const course = await this.coursesService.createCourse(createCourseDto);
    return ResponseHelper.success({ course }, 'Course created successfully');
  }

  @Get('teacher/:teacherId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List courses created by a teacher' })
  @ApiParam({ name: 'teacherId', description: 'Teacher ID (Mongo ObjectId)' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          courses: [
            {
              id: '652fd6a7e5a69c0012345678',
              courseName: 'Algebra Basics',
              teacherId: '652fd6a7e5a69c0012344321',
              enrollmentCount: 42,
              createdAt: '2025-10-11T04:20:31.123Z',
              updatedAt: '2025-10-11T04:20:31.123Z',
              teacherName: 'John Doe',
            },
          ],
        },
        message: 'Courses retrieved successfully',
      },
    },
  })
  async getCoursesByTeacher(@Param('teacherId') teacherId: string) {
    const courses = await this.coursesService.getCoursesByTeacher(teacherId);
    return ResponseHelper.success(
      { courses },
      'Courses retrieved successfully',
    );
  }
}
