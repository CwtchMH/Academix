export type CourseStatus = 'Active' | 'Upcoming' | 'Completed'

export interface CourseCardProps {
  title: string
  code: string
  status: CourseStatus
  category: string
  startDate: string
  endDate?: string
  studentCount?: number
  instructor?: string
  onManage?: () => void
  onViewDetails?: () => void
}
