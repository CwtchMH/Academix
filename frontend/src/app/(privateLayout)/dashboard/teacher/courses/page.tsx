'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { message, Modal } from 'antd'
import { Button, Icon, Input } from '@/components/atoms'
import { CourseCard } from '@/components/molecules'
import {
  CreateCourseModal,
  type CreateCourseFormValues
} from '@/components/organisms'
import { useCreateCourse, useTeacherCourses } from '@/services/api/course.api'
import { useAuth } from '@/stores/auth'

const CoursesPage: React.FC = () => {
  const { user, getUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCourseInfo, setCreatedCourseInfo] = useState<{
    id: string
    name: string
  } | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const createCourseMutation = useCreateCourse()

  useEffect(() => {
    if (!user?.id) {
      void getUser()
    }
  }, [user?.id, getUser])

  const { data, isLoading, isFetching, isError, error, refetch } =
    useTeacherCourses(user?.id, {
      enabled: Boolean(user?.id),
      refetchOnWindowFocus: false
    })

  const courses = data?.data.courses ?? []
  const responseMessage = data?.message

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return courses
    return courses.filter((course) => {
      const courseName = course.courseName?.toLowerCase() ?? ''
      const courseId = course.id?.toLowerCase() ?? ''
      return (
        courseName.includes(normalizedSearch) ||
        courseId.includes(normalizedSearch)
      )
    })
  }, [courses, searchTerm])

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    setCreatedCourseInfo(null)
  }

  const handleCopyCourseId = () => {
    if (!createdCourseInfo?.id) return

    if (!navigator?.clipboard) {
      message.error('Clipboard access is not available in this browser.')
      return
    }

    navigator.clipboard
      .writeText(createdCourseInfo.id)
      .then(() => message.success('Course ID copied to clipboard'))
      .catch(() => message.error('Failed to copy course ID'))
  }

  const handleCreateCourseSubmit = async (
    values: CreateCourseFormValues
  ): Promise<void> => {
    setIsSubmitting(true)

    try {
      let teacherId = user?.id

      if (!teacherId) {
        await getUser()
        teacherId = useAuth.getState().user?.id
      }

      if (!teacherId) {
        message.error('Unable to identify the logged-in teacher.')
        return
      }

      const response = await createCourseMutation.mutateAsync({
        data: { courseName: values.title.trim(), teacherId }
      })

      if (!response.success) {
        message.error(response.message ?? 'Failed to create course')
        return
      }

      const { course } = response.data

      setIsModalOpen(false)
      setCreatedCourseInfo({ id: course.id, name: course.courseName })
      setIsSuccessModalOpen(true)
      message.success(response.message ?? 'Course created successfully')
      await refetch()
    } catch (error) {
      console.error('Create course failed:', error)
      message.error('Failed to create course')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <React.Fragment>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Courses</h1>
            {responseMessage ? (
              <p className="mt-2 text-sm text-slate-500">
                Your courses, your responsibiity
              </p>
            ) : null}
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
                placeholder="Search by title or ID..."
                prefix={<Icon name="search" size="small" />}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
          </div>
        </section>

        {isLoading || isFetching ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading courses...
          </div>
        ) : null}

        {isError ? (
          <div className="space-y-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            <p>Failed to load courses.</p>
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => void refetch()}
            >
              Try again
            </button>
            {error instanceof Error ? (
              <p className="text-xs text-red-500">{error.message}</p>
            ) : null}
          </div>
        ) : null}

        {!isLoading && !isFetching && !isError ? (
          filteredCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  courseName={course.courseName}
                  courseId={course.id}
                  teacherId={course.teacherId}
                  teacherName={course.teacherName}
                  enrollmentCount={course.enrollmentCount}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No courses match your search.
            </div>
          )
        ) : null}
      </div>

      <CreateCourseModal
        open={isModalOpen}
        loading={isSubmitting}
        categoryOptions={[]}
        levelOptions={[]}
        onClose={handleCloseModal}
        onSubmit={handleCreateCourseSubmit}
      />

      <Modal
        open={isSuccessModalOpen}
        onCancel={handleSuccessModalClose}
        footer={null}
        centered
        width={420}
        maskClosable
        className="max-w-full px-4"
      >
        <div className="space-y-4 text-center">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Course Created Successfully
            </h3>
            <p className="text-sm text-slate-500">
              {createdCourseInfo?.name ?? 'Your course'} is now available. Use
              the ID below for future references.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <code className="truncate font-mono text-sm text-slate-700">
              {createdCourseInfo?.id}
            </code>
            <Button variant="outline" size="small" onClick={handleCopyCourseId}>
              Copy ID
            </Button>
          </div>
          <Button variant="primary" fullWidth onClick={handleSuccessModalClose}>
            Close
          </Button>
        </div>
      </Modal>
    </React.Fragment>
  )
}

export default CoursesPage
