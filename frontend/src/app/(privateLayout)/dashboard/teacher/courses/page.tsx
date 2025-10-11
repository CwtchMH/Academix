'use client'

import React, { useMemo, useState } from 'react'
import { message } from 'antd'
import {
  Button,
  Icon,
  Input,
  Select,
  type SelectOption
} from '@/components/atoms'
import { CourseCard, type CourseStatus } from '@/components/molecules'
import {
  CreateCourseModal,
  type CreateCourseFormValues
} from '@/components/organisms'

interface CourseListItem {
  id: string
  title: string
  code: string
  status: CourseStatus
  category: string
  categoryValue: string
  startDate: string
  endDate?: string
  studentCount?: number
  instructor?: string
}

const statusFilterOptions: SelectOption[] = [
  { label: 'Status: All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' }
]

const courseCategoryOptions: SelectOption[] = [
  { label: 'All Categories', value: 'all' },
  { label: 'Computer Science', value: 'computer-science' },
  { label: 'Data & Analytics', value: 'data-analytics' },
  { label: 'Business & Management', value: 'business-management' },
  { label: 'Design & Creativity', value: 'design-creativity' }
]

const courseLevelOptions: SelectOption[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
]

const initialCourses: CourseListItem[] = [
  {
    id: 'course-1',
    title: 'Fundamentals of Web Development',
    code: 'WEB101',
    status: 'Active',
    category: 'Computer Science',
    categoryValue: 'computer-science',
    startDate: 'Sep 5, 2024 09:00',
    endDate: 'Dec 15, 2024 17:00',
    studentCount: 184,
    instructor: 'Alex Johnson'
  },
  {
    id: 'course-2',
    title: 'Data Storytelling with Tableau',
    code: 'DATA204',
    status: 'Upcoming',
    category: 'Data & Analytics',
    categoryValue: 'data-analytics',
    startDate: 'Nov 12, 2024 14:00',
    endDate: 'Jan 30, 2025 16:00',
    studentCount: 96,
    instructor: 'Morgan Lee'
  },
  {
    id: 'course-3',
    title: 'Leading High-Performing Teams',
    code: 'BUS320',
    status: 'Completed',
    category: 'Business & Management',
    categoryValue: 'business-management',
    startDate: 'Jan 10, 2024 10:00',
    endDate: 'Apr 20, 2024 15:00',
    studentCount: 142,
    instructor: 'Priya Patel'
  }
]

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseListItem[]>(initialCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const normalizedStatus = statusFilter === 'all' ? undefined : statusFilter
    const normalizedCategory =
      categoryFilter === 'all' ? undefined : categoryFilter

    return courses.filter((course) => {
      const matchesSearch = normalizedSearch
        ? course.title.toLowerCase().includes(normalizedSearch) ||
          course.code.toLowerCase().includes(normalizedSearch)
        : true

      const matchesStatus = normalizedStatus
        ? course.status.toLowerCase() === normalizedStatus
        : true

      const matchesCategory = normalizedCategory
        ? course.categoryValue === normalizedCategory
        : true

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [courses, searchTerm, statusFilter, categoryFilter])

  const handleCreateCourseSubmit = async (
    values: CreateCourseFormValues
  ): Promise<void> => {
    setIsSubmitting(true)
    try {
      // TODO: replace with API integration once the backend is available
      const categoryLabel = courseCategoryOptions.find(
        (option) => option.value === values.category
      )?.label

      const newCourse: CourseListItem = {
        id: `course-${Date.now()}`,
        title: values.title,
        code: values.code,
        status: 'Upcoming',
        category: categoryLabel ?? 'General',
        categoryValue: values.category ?? 'general',
        startDate: values.startDate
          ? values.startDate.format('MMM D, YYYY HH:mm')
          : 'Not scheduled',
        endDate: values.endDate
          ? values.endDate.format('MMM D, YYYY HH:mm')
          : undefined,
        studentCount: 0,
        instructor: values.instructor
      }

      setCourses((prev) => [newCourse, ...prev])
      setIsModalOpen(false)
      message.success('Course draft saved')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  return (
    <React.Fragment>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Courses</h1>
            <p className="mt-2 text-sm text-slate-500">
              Create new courses and manage the ones you are already running.
            </p>
          </div>
          <Button
            variant="primary"
            size="medium"
            className="self-start md:self-auto"
            onClick={handleOpenModal}
          >
            + Create New Course
          </Button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                placeholder="Search by title or code..."
                prefix={<Icon name="search" size="small" />}
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
              />
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <Select
                value={statusFilter}
                options={statusFilterOptions}
                onChange={(value) => setStatusFilter(value as string)}
                className="!h-12"
              />
              <Select
                value={categoryFilter}
                options={courseCategoryOptions}
                onChange={(value) => setCategoryFilter(value as string)}
                className="!h-12"
              />
              <Select
                placeholder="Level"
                options={courseLevelOptions}
                onChange={(_value) => undefined}
                className="!h-12"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Registered Courses
          </h2>
          {filteredCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  code={course.code}
                  status={course.status}
                  category={course.category}
                  startDate={course.startDate}
                  endDate={course.endDate}
                  studentCount={course.studentCount}
                  instructor={course.instructor}
                  onManage={() => message.info('Manage course coming soon')}
                  onViewDetails={() =>
                    message.info('Course details will be available soon')
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              <Icon name="courses" className="text-slate-400" size="large" />
              <p>No courses match your current filters.</p>
              <Button variant="outline" size="small" onClick={handleOpenModal}>
                Create your first course
              </Button>
            </div>
          )}
        </section>
      </div>

      <CreateCourseModal
        open={isModalOpen}
        loading={isSubmitting}
        categoryOptions={courseCategoryOptions.slice(1)}
        levelOptions={courseLevelOptions}
        onClose={handleCloseModal}
        onSubmit={handleCreateCourseSubmit}
      />
    </React.Fragment>
  )
}

export default CoursesPage
