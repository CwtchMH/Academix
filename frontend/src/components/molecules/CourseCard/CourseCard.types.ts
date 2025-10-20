export interface CourseCardProps {
  courseName: string
  publicId: string
  teacherId: string
  teacherName: string
  enrollmentCount: number
  onDelete?: () => void
  isDeleting?: boolean
}
