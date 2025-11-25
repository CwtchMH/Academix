'use client'

import { useCallback, useMemo } from 'react'
import { App, Spin, Tooltip } from 'antd'
import { Badge, Button, Icon, Input, Select } from '@/components/atoms'
import { useRouter } from 'next/navigation'
import { useDeleteExam, useExams } from '@/services/api/exam.api'
import { useAuth } from '@/stores/auth'

type ExamStatus = 'active' | 'scheduled' | 'completed'

interface ExamRow {
  id: string
  code: string
  status: ExamStatus
  startTime: string
  endTime: string
  isEditable: boolean
}

const statusFilterOptions = [
  { label: 'Status: All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' }
]

const timeframeOptions = [
  { label: 'Timeframe: All', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' }
]

const statusVariantMap: Record<
  ExamStatus,
  'active' | 'scheduled' | 'completed'
> = {
  active: 'active',
  scheduled: 'scheduled',
  completed: 'completed'
}

const statusLabelMap: Record<ExamStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  completed: 'Completed'
}

const normalizeStatus = (status: string): ExamStatus => {
  const normalized = status?.toLowerCase() as ExamStatus
  if (
    normalized === 'active' ||
    normalized === 'scheduled' ||
    normalized === 'completed'
  ) {
    return normalized
  }
  return 'scheduled'
}

const formatDateTime = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString))
  } catch (error) {
    void error
    return isoString
  }
}

export default function ExamsPage() {
  const { message, modal } = App.useApp()
  const router = useRouter()
  const { user } = useAuth()
  const {
    data: examsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useExams(user?.id ?? '', {
    enabled: Boolean(user?.id),
    refetchOnWindowFocus: false
  })

  const deleteExamMutation = useDeleteExam({
    onSuccess: async () => {
      message.success('Exam deleted successfully')
      await refetch()
    },
    onError: (mutationError: unknown) => {
      const reason =
        mutationError instanceof Error
          ? mutationError.message
          : 'Unable to delete exam'
      message.error(reason)
    }
  })

  const exams = examsResponse?.data.exams ?? []
  const isBusy = isLoading || isFetching

  const examRows = useMemo<ExamRow[]>(() => {
    return exams.map((exam): ExamRow => {
      const normalizedStatus = normalizeStatus(exam.status)
      return {
        id: exam.id,
        code: exam.publicId,
        status: normalizedStatus,
        startTime: formatDateTime(exam.startTime),
        endTime: formatDateTime(exam.endTime),
        isEditable: normalizedStatus === 'scheduled'
      }
    })
  }, [exams])

  const handleCreateExam = () => {
    router.push('/dashboard/teacher/exams/create')
  }

  const handleCopyExamCode = useCallback(
    (code: string) => {
      if (!code) {
        return
      }

      if (!navigator?.clipboard) {
        message.error('Clipboard access is not available in this browser.')
        return
      }

      navigator.clipboard
        .writeText(code)
        .then(() => message.success('Exam code copied to clipboard'))
        .catch(() => message.error('Failed to copy exam code'))
    },
    [message]
  )

  const handleDeleteExam = useCallback(
    (exam: ExamRow) => {
      modal.confirm({
        title: 'Delete exam',
        content: `This will permanently remove exam ${exam.code} regardless of its status. This action cannot be undone.`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
          await deleteExamMutation.mutateAsync({ examId: exam.id })
        }
      })
    },
    [deleteExamMutation, modal]
  )

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Exams</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage and monitor all exams created within the platform.
          </p>
        </div>
        <Button
          size="medium"
          variant="primary"
          className="self-start md:self-auto"
          onClick={handleCreateExam}
        >
          + Create New Exam
        </Button>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <Input
                placeholder="Search for exams..."
                prefix={<Icon name="search" />}
                onChange={(_value) => undefined}
              />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <Select
                value="all"
                options={statusFilterOptions}
                onChange={(_value) => undefined}
                className="min-w-[180px]"
              />
              <Select
                value="all"
                options={timeframeOptions}
                onChange={(_value) => undefined}
                className="min-w-[180px]"
              />
            </div>
          </div>

          {isBusy ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
              <Spin tip="Loading..."></Spin>
            </div>
          ) : isError ? (
            <div className="space-y-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              <p>Failed to load exams.</p>
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
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-100px)]">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-4 py-3">
                      Exam Code
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Start Time
                    </th>
                    <th scope="col" className="px-4 py-3">
                      End Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {examRows.length > 0 ? (
                    examRows.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-slate-900">
                              {exam.code}
                            </span>
                            <Tooltip title="Copy exam code">
                              <Button
                                size="small"
                                variant="outline"
                                className="!px-2"
                                onClick={() => handleCopyExamCode(exam.code)}
                                aria-label="Copy exam code"
                              >
                                Copy
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            label={statusLabelMap[exam.status] ?? exam.status}
                            variant={statusVariantMap[exam.status] ?? 'default'}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {exam.startTime}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {exam.endTime}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="small"
                              variant="outline"
                              className="!px-3"
                              onClick={() =>
                                router.push(
                                  `/dashboard/teacher/exams/${exam.code}`
                                )
                              }
                            >
                              View Details
                            </Button>
                            <Button
                              size="small"
                              variant="outline"
                              className="!px-3"
                              onClick={() =>
                                router.push(
                                  `/dashboard/teacher/exams/${exam.id}/results`
                                )
                              }
                            >
                              View Results
                            </Button>
                            <Tooltip
                              title={
                                exam.isEditable
                                  ? undefined
                                  : 'Only scheduled exams can be edited'
                              }
                            >
                              <Button
                                size="small"
                                variant="outline"
                                className="!px-3"
                                disabled={!exam.isEditable}
                                aria-disabled={!exam.isEditable}
                                onClick={() => {
                                  if (!exam.isEditable) {
                                    return
                                  }
                                  router.push(
                                    `/dashboard/teacher/exams/create?examId=${exam.id}`
                                  )
                                }}
                              >
                                Edit
                              </Button>
                            </Tooltip>
                            <Tooltip title="Delete exam">
                              <Button
                                size="small"
                                variant="outline"
                                className="!px-3 !text-red-600"
                                disabled={
                                  deleteExamMutation.isPending &&
                                  deleteExamMutation.variables?.examId ===
                                    exam.id
                                }
                                loading={
                                  deleteExamMutation.isPending &&
                                  deleteExamMutation.variables?.examId ===
                                    exam.id
                                }
                                onClick={() => handleDeleteExam(exam)}
                              >
                                Delete
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No exams found. Create your first exam to see it listed
                        here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
