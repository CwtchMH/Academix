import React from 'react'
import { message } from 'antd'
import { Button, Icon } from '@/components/atoms'
import type { CourseCardProps } from './CourseCard.types'

export const CourseCard: React.FC<CourseCardProps> = ({
  courseName,
  courseId,
  teacherName,
  teacherId,
  enrollmentCount
}) => {
  const handleCopyCourseId = () => {
    if (!courseId) return

    if (!navigator?.clipboard) {
      message.error('Clipboard access is not available in this browser.')
      return
    }

    navigator.clipboard
      .writeText(courseId)
      .then(() => message.success('Course ID copied to clipboard'))
      .catch(() => message.error('Failed to copy course ID'))
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <header className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{courseName}</h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm text-slate-500">
            Course ID:{' '}
            <span className="font-mono text-slate-600">{courseId}</span>
          </p>
          <Button
            variant="outline"
            size="small"
            className="sm:w-auto"
            onClick={handleCopyCourseId}
          >
            Copy ID
          </Button>
        </div>
      </header>

      <dl className="space-y-2 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <Icon
            name="dashboard"
            size="small"
            className="mt-0.5 text-blue-500"
          />
          <div>
            <dt className="font-medium text-slate-500">Teacher Name</dt>
            <dd className="text-slate-700">{teacherName}</dd>
            <p className="text-xs text-slate-500">ID: {teacherId}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Icon
            name="students"
            size="small"
            className="mt-0.5 text-emerald-500"
          />
          <div>
            <dt className="font-medium text-slate-500">Enrollment Count</dt>
            <dd className="text-slate-700">{enrollmentCount}</dd>
          </div>
        </div>
      </dl>
    </article>
  )
}
