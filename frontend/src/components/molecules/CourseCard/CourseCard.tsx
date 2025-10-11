import React from 'react'
import { Badge, Button, Icon } from '@/components/atoms'
import type { BadgeVariant } from '@/components/atoms'
import type { CourseCardProps, CourseStatus } from './CourseCard.types'

const statusVariantMap: Record<CourseStatus, BadgeVariant> = {
  Active: 'active',
  Upcoming: 'scheduled',
  Completed: 'completed'
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  code,
  status,
  category,
  startDate,
  endDate,
  studentCount,
  instructor,
  onManage,
  onViewDetails
}) => {
  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{code}</p>
          </div>
          <Badge label={status} variant={statusVariantMap[status]} />
        </header>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Icon name="courses" size="small" className="text-blue-500" />
            {category}
          </span>
          {instructor ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="students" size="small" className="text-emerald-500" />
              {instructor}
            </span>
          ) : null}
          {typeof studentCount === 'number' ? (
            <span className="inline-flex items-center gap-2">
              <Icon name="students" size="small" className="text-violet-500" />
              {studentCount} enrolled
            </span>
          ) : null}
        </div>

        <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <Icon name="results" size="small" className="text-slate-400" />
            <span className="font-medium text-slate-700">Start:</span>
            <span>{startDate}</span>
          </div>
          {endDate ? (
            <div className="flex items-center gap-2">
              <Icon
                name="certificates"
                size="small"
                className="text-slate-400"
              />
              <span className="font-medium text-slate-700">End:</span>
              <span>{endDate}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <Button
          variant="outline"
          size="small"
          className="sm:w-auto"
          onClick={onViewDetails}
        >
          View Details
        </Button>
        <Button
          variant="primary"
          size="small"
          className="sm:w-auto"
          onClick={onManage}
        >
          Manage Course
        </Button>
      </div>
    </article>
  )
}
