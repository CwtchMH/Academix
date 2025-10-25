'use client'

import React, { useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, Table, Empty, Typography, Space, Row, Col } from 'antd'
import './styles.css'
import type { ColumnsType } from 'antd/es/table'
import { Icon, Input, Select, Button, Badge } from '@/components/atoms'
import { useExamResults, type ExamResultEntity } from '@/services/api/exam.api'
import { FilterBar } from '@/components/molecules'

const { Title, Text } = Typography

type StudentStatusFilter = 'all' | 'pass' | 'fail'
type SortOption = 'name_asc' | 'name_desc' | 'grade_desc' | 'grade_asc'

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pass', value: 'pass' },
  { label: 'Fail', value: 'fail' }
]

const sortOptions = [
  { label: 'Student Name (A-Z)', value: 'name_asc' },
  { label: 'Student Name (Z-A)', value: 'name_desc' },
  { label: 'Grade (High to Low)', value: 'grade_desc' },
  { label: 'Grade (Low to High)', value: 'grade_asc' }
]

const getStatusTag = (status: ExamResultEntity['status']) => {
  if (status === 'pass') {
    return <Badge label="Pass" variant="success" />
  }
  if (status === 'fail') {
    return <Badge label="Fail" variant="danger" />
  }
  return <Badge label="Unknown" variant="default" />
}

const getGradeDisplay = (record: ExamResultEntity) => {
  return `${record.grade}/${record.maxGrade}`
}

const ResultsPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const examId = params?.examId as string
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('name_asc')
  const [minGrade, setMinGrade] = useState('')
  const [maxGrade, setMaxGrade] = useState('')

  const { data, isLoading, isFetching, isError, error, refetch } =
    useExamResults(examId, {
      enabled: Boolean(examId),
      refetchOnWindowFocus: false
    })

  const exam = data?.data.exam
  const results = data?.data.results ?? []

  const minGradeValue = useMemo(() => {
    if (!minGrade.trim()) {
      return null
    }
    const parsed = Number(minGrade)
    return Number.isFinite(parsed) ? parsed : null
  }, [minGrade])

  const maxGradeValue = useMemo(() => {
    if (!maxGrade.trim()) {
      return null
    }
    const parsed = Number(maxGrade)
    return Number.isFinite(parsed) ? parsed : null
  }, [maxGrade])

  const filteredResults = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    return results
      .filter((result) => {
        const matchesSearch = normalizedTerm
          ? result.studentName.toLowerCase().includes(normalizedTerm) ||
            result.studentCode.toLowerCase().includes(normalizedTerm)
          : true
        const matchesStatus =
          statusFilter === 'all' ? true : result.status === statusFilter
        const matchesMin =
          minGradeValue === null ? true : result.grade >= minGradeValue
        const matchesMax =
          maxGradeValue === null ? true : result.grade <= maxGradeValue
        return matchesSearch && matchesStatus && matchesMin && matchesMax
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'grade_desc':
            return b.grade - a.grade
          case 'grade_asc':
            return a.grade - b.grade
          case 'name_desc':
            return b.studentName.localeCompare(a.studentName)
          case 'name_asc':
          default:
            return a.studentName.localeCompare(b.studentName)
        }
      })
  }, [
    results,
    searchTerm,
    statusFilter,
    sortOption,
    minGradeValue,
    maxGradeValue
  ])

  const examStats = useMemo(() => {
    const totalStudents = results.length
    const totalPass = results.filter(
      (result) => result.status === 'pass'
    ).length
    const passRate = totalStudents > 0 ? (totalPass / totalStudents) * 100 : 0
    const totalGrades = results.reduce((acc, result) => acc + result.grade, 0)
    const averageGrade = totalStudents > 0 ? totalGrades / totalStudents : 0
    const maxGradeAvailable = results[0]?.maxGrade ?? 0

    return {
      totalStudents,
      totalPass,
      passRate,
      averageGrade,
      maxGradeAvailable
    }
  }, [results])

  const columns: ColumnsType<ExamResultEntity> = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      sorter: true,
      render: (text: string) => (
        <Text strong className="text-slate-900">
          {text}
        </Text>
      ),
      sortOrder:
        sortOption === 'name_asc'
          ? 'ascend'
          : sortOption === 'name_desc'
          ? 'descend'
          : undefined
    },
    {
      title: 'Student Code',
      dataIndex: 'studentCode',
      key: 'studentCode',
      render: (code: string) => (
        <Text className="font-mono text-sm text-slate-500">{code}</Text>
      )
    },
    {
      title: 'Grade',
      key: 'grade',
      align: 'center',
      render: (_, record) => (
        <Text className="font-semibold text-slate-900">
          {getGradeDisplay(record)}
        </Text>
      ),
      sorter: true,
      sortOrder:
        sortOption === 'grade_desc'
          ? 'descend'
          : sortOption === 'grade_asc'
          ? 'ascend'
          : undefined
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: ExamResultEntity['status']) => getStatusTag(status)
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: () => (
        <Space size="small">
          <Button size="small" variant="outline" className="!px-4">
            Send Feedback
          </Button>
        </Space>
      ),
      responsive: ['lg']
    }
  ]

  const isBusy = isLoading || isFetching

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Title level={3} className="!m-0 text-slate-900">
            Exam Results{exam?.title ? `: ${exam.title}` : ''}
          </Title>
          <Text type="secondary">
            Review performance and manage student results for this exam.
          </Text>
        </div>
        <Space wrap>
          <Button variant="outline" size="medium" onClick={handleBack}>
            <span className="flex items-center gap-2">
              <Icon name="arrow-left" />
              Back
            </span>
          </Button>
          <Button variant="primary" size="medium">
            Export Report
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm">
            <Space direction="vertical" size={4}>
              <Text type="secondary">Total Students</Text>
              <Title level={4} className="!m-0">
                {examStats.totalStudents}
              </Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm">
            <Space direction="vertical" size={4}>
              <Text type="secondary">Average Grade</Text>
              <Title level={4} className="!m-0">
                {examStats.maxGradeAvailable
                  ? `${examStats.averageGrade.toFixed(1)}/${
                      examStats.maxGradeAvailable
                    }`
                  : examStats.averageGrade.toFixed(1)}
              </Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm">
            <Space direction="vertical" size={4}>
              <Text type="secondary">Pass Rate</Text>
              <Title level={4} className="!m-0 text-emerald-600">
                {examStats.passRate.toFixed(0)}%
              </Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-3xl border border-slate-200 shadow-sm">
            <Space direction="vertical" size={4}>
              <Text type="secondary">Status</Text>
              <div className="flex items-center gap-2">
                {exam?.status ? (
                  <Badge
                    label={exam.status}
                    variant={
                      exam.status.toLowerCase() === 'completed'
                        ? 'completed'
                        : exam.status.toLowerCase() === 'active'
                        ? 'active'
                        : 'scheduled'
                    }
                  />
                ) : (
                  <Text>-</Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <FilterBar
        options={[
          {
            key: 'search',
            colProps: { xs: 24, lg: 8 },
            content: (
              <Input
                placeholder="Search by name or code..."
                prefix={<Icon name="search" />}
                value={searchTerm}
                onChange={setSearchTerm}
              />
            )
          },
          {
            key: 'status',
            colProps: { xs: 24, sm: 12, lg: 5 },
            content: (
              <Select
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as StudentStatusFilter)
                }
                options={statusOptions}
                placeholder="Filter by status"
              />
            )
          },
          {
            key: 'grade',
            colProps: { xs: 24, sm: 12, lg: 6 },
            content: (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={minGrade}
                  onChange={setMinGrade}
                  min={0}
                />
                <span className="text-slate-400">-</span>
                <Input
                  placeholder="Max"
                  type="number"
                  value={maxGrade}
                  onChange={setMaxGrade}
                  min={0}
                />
              </div>
            )
          },
          {
            key: 'sort',
            colProps: { xs: 24, sm: 12, lg: 5 },
            content: (
              <Select
                value={sortOption}
                onChange={(value) => setSortOption(value as SortOption)}
                options={sortOptions}
                placeholder="Sort results"
              />
            )
          }
        ]}
      />

      <Card className="rounded-3xl border border-slate-200 shadow-sm">
        <Table<ExamResultEntity>
          rowKey={(record) => record.studentId}
          columns={columns}
          dataSource={filteredResults}
          loading={isBusy}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          className="exam-results-table"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  isError
                    ? 'Failed to load results. Please try again.'
                    : 'No results found for this exam.'
                }
              />
            )
          }}
          onChange={(_pagination, _filters, sorter) => {
            const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter
            if (!activeSorter?.order) {
              return
            }
            if (activeSorter.columnKey === 'studentName') {
              setSortOption(
                activeSorter.order === 'descend' ? 'name_desc' : 'name_asc'
              )
            }
            if (activeSorter.columnKey === 'grade') {
              setSortOption(
                activeSorter.order === 'descend' ? 'grade_desc' : 'grade_asc'
              )
            }
          }}
        />
        {isError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p>Failed to load exam results.</p>
            <Button variant="link" size="small" onClick={() => void refetch()}>
              Try again
            </Button>
            {error instanceof Error ? (
              <p className="text-xs text-red-500">{error.message}</p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export default ResultsPage
