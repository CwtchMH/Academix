'use client'

import React, { useMemo, useState } from 'react'
import { App, Modal, Spin } from 'antd'
import { Button, Icon, Input } from '@/components/atoms'
import { CourseCard } from '@/components/molecules'
import {
  CreateCourseModal,
  type CreateCourseFormValues
} from '@/components/organisms'
import {
  useCreateCourse,
  useDeleteCourse,
  useTeacherCourses,
  type TeacherCourseEntity
} from '@/services/api/course.api'
import { useAuth } from '@/stores/auth'

const CoursesPage: React.FC = () => {
  const { message } = App.useApp()
  const { user, getUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCourseInfo, setCreatedCourseInfo] = useState<{
    publicId: string
    name: string
  } | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [coursePendingDeletion, setCoursePendingDeletion] =
    useState<TeacherCourseEntity | null>(null)

  const createCourseMutation = useCreateCourse()
  const deleteCourseMutation = useDeleteCourse()

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
      const courseId = course.publicId?.toLowerCase() ?? ''
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
    if (!createdCourseInfo?.publicId) return

    if (!navigator?.clipboard) {
      message.error('Clipboard access is not available in this browser.')
      return
    }

    navigator.clipboard
      .writeText(createdCourseInfo.publicId)
      .then(() => message.success('Course ID copied to clipboard'))
      .catch(() => message.error('Failed to copy course ID'))
  }

  const handleRequestDeleteCourse = (course: TeacherCourseEntity) => {
    setCoursePendingDeletion(course)
  }

  const handleCancelDeleteCourse = () => {
    if (deleteCourseMutation.isPending) {
      return
    }
    setCoursePendingDeletion(null)
  }

  const handleConfirmDeleteCourse = async () => {
    if (!coursePendingDeletion) {
      return
    }

    try {
      const response = await deleteCourseMutation.mutateAsync(
        coursePendingDeletion.id
      )

      if (!response?.success) {
        message.error(response?.message ?? 'Failed to delete course')
        return
      }

      message.success(response.message ?? 'Course deleted successfully')
      setCoursePendingDeletion(null)
      await refetch()
    } catch (error) {
      console.error('Delete course failed:', error)
      message.error('Failed to delete course')
    }
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
      setCreatedCourseInfo({
        publicId: course.publicId,
        name: course.courseName
      })
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
          <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-6">
            <Spin tip="Loading courses..." />
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
                  publicId={course.publicId}
                  teacherId={course.teacherId}
                  teacherName={course.teacherName}
                  enrollmentCount={course.enrollmentCount}
                  onDelete={() => handleRequestDeleteCourse(course)}
                  isDeleting={
                    deleteCourseMutation.isPending &&
                    coursePendingDeletion?.id === course.id
                  }
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
        open={Boolean(coursePendingDeletion)}
        title="Delete course"
        okText="Delete"
        cancelText="Cancel"
        centered
        okButtonProps={{ danger: true }}
        onOk={handleConfirmDeleteCourse}
        onCancel={handleCancelDeleteCourse}
        confirmLoading={deleteCourseMutation.isPending}
        maskClosable={false}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this course? This action cannot be
            undone.
          </p>
          {coursePendingDeletion ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">
                {coursePendingDeletion.courseName}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                ID: {coursePendingDeletion.publicId}
              </p>
            </div>
          ) : null}
        </div>
      </Modal>

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
              {createdCourseInfo?.publicId}
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
