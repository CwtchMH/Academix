'use client'

import { useMemo, useCallback } from 'react'
import { Icon } from '@/components/atoms'
import {
  ExamPerformanceChart,
  type ExamPerformanceRecord,
  type ExamPerformanceSummary,
  StatCard
} from '@/components/molecules'
import { useTeacherDashboard } from '@/services/api/dashboard.api'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'

type ExamStatus = 'active' | 'scheduled' | 'completed'

const numberFormatter = new Intl.NumberFormat()

const PLACEHOLDER_EXAM_PERFORMANCE_RECORDS: ExamPerformanceRecord[] = [
  {
    examId: 'placeholder-1',
    examName: 'Midterm A',
    passCount: 48,
    failCount: 12
  },
  {
    examId: 'placeholder-2',
    examName: 'Final A',
    passCount: 54,
    failCount: 18
  },
  {
    examId: 'placeholder-3',
    examName: 'Quiz Series',
    passCount: 32,
    failCount: 8
  }
]

const CERTIFICATES_PLACEHOLDER = 8921

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

export default function TeacherDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const teacherId = user?.id ?? ''
  const { data: dashboardResponse } = useTeacherDashboard(teacherId, {
    refetchOnWindowFocus: false
  })

  const dashboardData = dashboardResponse?.data
  const statsData = dashboardData?.stats
  const activeExams = dashboardData?.activeExams ?? []
  const examPerformanceData = dashboardData?.examPerformance
  const totalStudents = statsData?.totalStudents ?? 0
  const certificatesIssued =
    statsData?.certificatesIssued ?? CERTIFICATES_PLACEHOLDER

  const hasInteractiveExamData = Boolean(
    (examPerformanceData?.records?.length ?? 0) > 0
  )

  const examPerformanceRecords = useMemo<ExamPerformanceRecord[]>(() => {
    const apiRecords = examPerformanceData?.records ?? []

    if (!apiRecords.length) {
      return PLACEHOLDER_EXAM_PERFORMANCE_RECORDS
    }

    return apiRecords
      .slice(0, 6)
      .map(({ examId, examName, passCount, failCount }) => ({
        examId,
        examName,
        passCount,
        failCount
      }))
  }, [examPerformanceData?.records])

  const examPerformanceSummary = useMemo<ExamPerformanceSummary>(() => {
    const aggregated = examPerformanceRecords.reduce(
      (acc, record) => {
        const total = record.passCount + record.failCount
        return {
          totalStudents: acc.totalStudents + total,
          passTotal: acc.passTotal + record.passCount
        }
      },
      { totalStudents: 0, passTotal: 0 }
    )

    const apiSummary = examPerformanceData?.summary

    const summaryTotalStudents =
      apiSummary?.totalStudents ?? aggregated.totalStudents
    const summaryPassRate =
      apiSummary?.passRate ??
      (aggregated.totalStudents
        ? (aggregated.passTotal / aggregated.totalStudents) * 100
        : 0)

    return {
      totalStudents: summaryTotalStudents,
      passRate: summaryPassRate
    }
  }, [examPerformanceData?.summary, examPerformanceRecords])

  const activeExamsCount = useMemo(() => {
    if (typeof statsData?.activeExams === 'number') {
      return statsData.activeExams
    }

    return activeExams.reduce((count, exam) => {
      return normalizeStatus(exam.status) === 'active' ? count + 1 : count
    }, 0)
  }, [activeExams, statsData?.activeExams])

  const stats = useMemo(
    () => [
      {
        title: 'Total Students',
        value: numberFormatter.format(totalStudents),
        description: 'Across all enrolled cohorts',
        accentColorClass: 'bg-blue-50 text-blue-600',
        icon: <Icon name="students" className="text-blue-600" size="large" />
      },
      {
        title: 'Active Exams',
        value: numberFormatter.format(activeExamsCount),
        description: 'Currently in progress',
        accentColorClass: 'bg-violet-50 text-violet-600',
        icon: <Icon name="exams" className="text-violet-600" size="large" />
      },
      {
        title: 'Certificates Issued',
        value: numberFormatter.format(certificatesIssued),
        description: 'Issued in the last 12 months',
        accentColorClass: 'bg-emerald-50 text-emerald-600',
        icon: (
          <Icon name="certificates" className="text-emerald-600" size="large" />
        )
      }
    ],
    [activeExamsCount, certificatesIssued, totalStudents]
  )

  const handleExamSelect = useCallback(
    (exam: ExamPerformanceRecord) => {
      if (!hasInteractiveExamData) {
        return
      }

      if (!exam.examId || exam.examId.startsWith('placeholder')) {
        return
      }

      router.push(`/dashboard/teacher/exams/${exam.examId}/results`)
    },
    [hasInteractiveExamData, router]
  )

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section>
        <ExamPerformanceChart
          records={examPerformanceRecords}
          summary={examPerformanceSummary}
          onExamSelect={hasInteractiveExamData ? handleExamSelect : undefined}
        />
      </section>
    </div>
  )
}
