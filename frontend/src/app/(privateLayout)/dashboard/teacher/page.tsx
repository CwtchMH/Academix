'use client'

import { Badge, Button, Icon, Input, Select } from '@/components/atoms'
import { StatCard } from '@/components/molecules'

type ExamStatus = 'Active' | 'Scheduled' | 'Completed'

interface ExamRow {
  code: string
  status: ExamStatus
  startTime: string
}

const stats = [
  {
    title: 'Total Students',
    value: '12,450',
    description: 'Across all enrolled cohorts',
    accentColorClass: 'bg-blue-50 text-blue-600',
    icon: <Icon name="students" className="text-blue-600" size="large" />
  },
  {
    title: 'Active Exams',
    value: '35',
    description: 'Currently in progress',
    accentColorClass: 'bg-violet-50 text-violet-600',
    icon: <Icon name="exams" className="text-violet-600" size="large" />
  },
  {
    title: 'Certificates Issued',
    value: '8,921',
    description: 'Issued in the last 12 months',
    accentColorClass: 'bg-emerald-50 text-emerald-600',
    icon: <Icon name="certificates" className="text-emerald-600" size="large" />
  }
]

const examRows: ExamRow[] = [
  {
    code: 'EXM2024-001',
    status: 'Active',
    startTime: '2024-03-15 09:00 AM'
  },
  {
    code: 'EXM2024-002',
    status: 'Completed',
    startTime: '2024-03-10 10:00 AM'
  },
  {
    code: 'EXM2024-003',
    status: 'Scheduled',
    startTime: '2024-03-20 11:00 AM'
  },
  {
    code: 'EXM2024-004',
    status: 'Active',
    startTime: '2024-03-16 01:00 PM'
  },
  {
    code: 'EXM2024-005',
    status: 'Completed',
    startTime: '2024-03-05 02:00 PM'
  }
]

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
  Active: 'active',
  Scheduled: 'scheduled',
  Completed: 'completed'
}

export default function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
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
        >
          + Create New Exam
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

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
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {examRows.map((exam) => (
                  <tr key={exam.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {exam.code}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={exam.status}
                        variant={statusVariantMap[exam.status] ?? 'default'}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {exam.startTime}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="small"
                          variant="outline"
                          className="!px-3"
                        >
                          View Results
                        </Button>
                        <Button
                          size="small"
                          variant="outline"
                          className="!px-3"
                        >
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
