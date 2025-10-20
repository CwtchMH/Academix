import { type UseQueryOptions } from '@tanstack/react-query'
import { CourseService } from '../index'

export interface CreateCourseRequest {
  courseName: string
  teacherId: string
}

export interface CourseEntity {
  id: string
  courseName: string
  publicId: string
  teacherId: string
  enrollmentCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateCourseResponse {
  success: boolean
  data: {
    course: CourseEntity
  }
  message: string
}

export interface TeacherCourseEntity extends CourseEntity {
  teacherName: string
}

export interface TeacherCoursesResponse {
  success: boolean
  data: {
    courses: TeacherCourseEntity[]
  }
  message: string
}

export interface DeleteCourseResponse {
  success: boolean
  message?: string
}

/**
 * Create a new course
 * POST /courses
 */
export const useCreateCourse = () => {
  return CourseService.usePost<CreateCourseResponse>({
    url: '/'
  })
}

export const useTeacherCourses = (
  teacherId?: string,
  options?: Omit<
    UseQueryOptions<TeacherCoursesResponse>,
    'queryKey' | 'queryFn'
  >
) => {
  return CourseService.useGet<TeacherCoursesResponse>({
    url: teacherId ? `/teacher/${teacherId}` : '',
    options: {
      enabled: Boolean(teacherId),
      ...options
    }
  })
}

export const useDeleteCourse = () => {
  return CourseService.useDelete<DeleteCourseResponse>({
    url: '/delete'
  })
}
