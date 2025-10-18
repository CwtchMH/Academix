import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../../database/schemas/course.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from '../../database/schemas/enrollment.schema';
import { CreateBasicCourseDto, CourseBasicResponseDto } from './dto/course.dto';
import { generatePrefixedPublicId } from '../../common/utils/public-id.util';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
  ) {}

  async createCourse(
    createCourseDto: CreateBasicCourseDto,
  ): Promise<CourseBasicResponseDto> {
    const { courseName, teacherId } = createCourseDto;

    const teacher = await this.userModel.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can create courses');
    }

    const publicId = await generatePrefixedPublicId('C', this.courseModel);
    const course = new this.courseModel({
      courseName,
      teacherId: new Types.ObjectId(teacherId),
      publicId,
    });

    const savedCourse = await course.save();
    return this.mapCourse(savedCourse, 0, teacher.fullName);
  }

  async getCoursesByTeacher(
    teacherId: string,
  ): Promise<CourseBasicResponseDto[]> {
    const teacher = await this.userModel.findById(teacherId);
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    if (teacher.role !== 'teacher') {
      throw new ForbiddenException('Only teachers can have courses');
    }

    const courses = await this.courseModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .sort({ createdAt: -1 });

    const courseIds = courses.map((course) => course._id);
    const enrollmentCounts = await this.enrollmentModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
    ]);

    const countMap = enrollmentCounts.reduce<Record<string, number>>(
      (acc, { _id, count }) => {
        acc[String(_id)] = count;
        return acc;
      },
      {},
    );

    return courses.map((course) =>
      this.mapCourse(
        course,
        countMap[String(course._id)] ?? 0,
        teacher.fullName,
      ),
    );
  }

  private mapCourse(
    course: CourseDocument,
    enrollmentCount: number,
    teacherName?: string,
  ): CourseBasicResponseDto {
    return {
      id: String(course._id),
      publicId: course.publicId,
      courseName: course.courseName,
      teacherId: String(course.teacherId),
      enrollmentCount,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      teacherName,
    };
  }
}
