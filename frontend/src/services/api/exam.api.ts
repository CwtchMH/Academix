import { type UseQueryOptions } from '@tanstack/react-query'
import { type ApiMutationOptionsOf, ExamService } from '../index'

export interface CreateExamAnswerRequest {
  content: string
}

export interface CreateExamQuestionRequest {
  content: string
  answerQuestion: number
  answer: CreateExamAnswerRequest[]
}

export interface CreateExamRequest {
  title: string
  durationMinutes: number
  startTime: string
  endTime: string
  status: string
  courseId: string
  rateScore: number
  questions: CreateExamQuestionRequest[]
  examCode?: string
}

export interface ExamAnswerEntity {
  content: string
  isCorrect: boolean
}

export interface ExamQuestionEntity {
  id: string
  content: string
  answerQuestion: number
  answer: ExamAnswerEntity[]
}

export interface ExamEntity {
  id: string
  title: string
  durationMinutes: number
  startTime: string
  endTime: string
  status: string
  courseId: string
  rateScore: number
  questions: ExamQuestionEntity[]
  createdAt: string
  updatedAt: string
}

export interface ExamSummaryEntity {
  id: string
  status: string
  startTime: string
  endTime: string
}

export interface CreateExamResponse {
  success: boolean
  data: {
    exam: ExamEntity
  }
  message: string
  meta?: {
    timestamp: string
  }
}

export const useCreateExam = (
  options?: ApiMutationOptionsOf<CreateExamResponse>
) => {
  return ExamService.usePost<CreateExamResponse>({ url: '/' }, options)
}

export interface ExamsResponse {
  success: boolean
  data: {
    exams: ExamSummaryEntity[]
  }
  message: string
}

export const useExams = (
  options?: Omit<UseQueryOptions<ExamsResponse>, 'queryKey' | 'queryFn'>
) => {
  return ExamService.useGet<ExamsResponse>({
    url: '/',
    options
  })
}
