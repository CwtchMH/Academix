import React, { useEffect, useMemo, useState } from 'react'
import { Modal } from 'antd'
import {
  Button,
  DateTimePicker,
  Input,
  Select,
  Textarea,
  type SelectOption
} from '@/components/atoms'
import type {
  CreateCourseFormValues,
  CreateCourseModalProps
} from './CreateCourseModal.types'

interface FormErrors {
  title?: string
  code?: string
  endDate?: string
}

const defaultFormValues: CreateCourseFormValues = {
  title: '',
  code: '',
  category: undefined,
  level: undefined,
  startDate: null,
  endDate: null,
  instructor: '',
  description: ''
}

/**
 * Modal used to collect core course information before persisting it.
 */
export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  open,
  loading = false,
  categoryOptions,
  levelOptions,
  initialValues,
  onClose,
  onSubmit
}) => {
  const [formValues, setFormValues] =
    useState<CreateCourseFormValues>(defaultFormValues)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (open) {
      setFormValues((prev) => ({
        ...prev,
        ...defaultFormValues,
        ...initialValues
      }))
      setErrors({})
    }
  }, [open, initialValues])

  const handleFieldChange = <K extends keyof CreateCourseFormValues>(
    key: K,
    value: CreateCourseFormValues[K]
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const validate = (): boolean => {
    const nextErrors: FormErrors = {}

    if (!formValues.title?.trim()) {
      nextErrors.title = 'Course title is required'
    }

    if (!formValues.code?.trim()) {
      nextErrors.code = 'Course code is required'
    }

    if (
      formValues.startDate &&
      formValues.endDate &&
      formValues.startDate.isAfter(formValues.endDate)
    ) {
      nextErrors.endDate = 'End date must be after the start date'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const payload: CreateCourseFormValues = {
      ...formValues,
      title: formValues.title.trim(),
      code: formValues.code.trim(),
      instructor: formValues.instructor?.trim() || undefined,
      description: formValues.description?.trim() || undefined
    }

    onSubmit(payload)
  }

  const memoizedCategoryOptions: SelectOption[] = useMemo(
    () => categoryOptions,
    [categoryOptions]
  )

  const memoizedLevelOptions: SelectOption[] = useMemo(
    () => levelOptions,
    [levelOptions]
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      maskClosable={!loading}
      destroyOnClose
      className="max-w-full px-4"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="space-y-6">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">
            Create A New Course
          </h2>
          <p className="text-sm text-slate-500">
            Provide the details below so you can save and publish the course
            later.
          </p>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="course-title"
            >
              Course Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="course-title"
              value={formValues.title}
              placeholder="e.g., Introduction to Data Science"
              onChange={(value) => handleFieldChange('title', value)}
            />
            {errors.title ? (
              <span className="text-xs text-red-500">{errors.title}</span>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="course-code"
            >
              Course Code <span className="text-red-500">*</span>
            </label>
            <Input
              id="course-code"
              value={formValues.code}
              placeholder="e.g., DS101"
              onChange={(value) => handleFieldChange('code', value)}
            />
            {errors.code ? (
              <span className="text-xs text-red-500">{errors.code}</span>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="course-category"
              >
                Category
              </label>
              <Select
                id="course-category"
                placeholder="Select category"
                value={formValues.category}
                options={memoizedCategoryOptions}
                onChange={(value) => {
                  const nextValue = value as string | number | undefined
                  handleFieldChange(
                    'category',
                    typeof nextValue === 'number'
                      ? String(nextValue)
                      : nextValue ?? undefined
                  )
                }}
                className="!h-12"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="course-level"
              >
                Level
              </label>
              <Select
                id="course-level"
                placeholder="Select level"
                value={formValues.level}
                options={memoizedLevelOptions}
                onChange={(value) => {
                  const nextValue = value as string | number | undefined
                  handleFieldChange(
                    'level',
                    typeof nextValue === 'number'
                      ? String(nextValue)
                      : nextValue ?? undefined
                  )
                }}
                className="!h-12"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="course-start-date"
              >
                Start Date
              </label>
              <DateTimePicker
                value={formValues.startDate}
                onChange={(value) => handleFieldChange('startDate', value)}
                placeholder="MM/DD/YYYY --:--"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="course-end-date"
              >
                End Date
              </label>
              <DateTimePicker
                value={formValues.endDate}
                onChange={(value) => handleFieldChange('endDate', value)}
                placeholder="MM/DD/YYYY --:--"
              />
              {errors.endDate ? (
                <span className="text-xs text-red-500">{errors.endDate}</span>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="course-description"
            >
              Short Description
            </label>
            <Textarea
              id="course-description"
              value={formValues.description ?? ''}
              placeholder="Summarize the course objectives and outcomes"
              rows={4}
              onChange={(value) => handleFieldChange('description', value)}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="sm:w-auto"
            onClick={handleSubmit}
            loading={loading}
          >
            Save Draft
          </Button>
        </div>
      </div>
    </Modal>
  )
}
