import {
  useMutation,
  type UseMutationOptions,
  type UseQueryOptions
} from '@tanstack/react-query'
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
  publicId: string
  status: string
  startTime: string
  endTime: string
}

export interface ExamResultEntity {
  studentId: string
  studentName: string
  studentCode: string
  grade: number
  maxGrade: number
  status: 'pass' | 'fail'
}

export interface ExamResultsResponse {
  success: boolean
  data: {
    exam: ExamEntity
    results: ExamResultEntity[]
  }
  message: string
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

export interface GetExamResponse {
  success: boolean
  data: {
    exam: ExamEntity
  }
  message: string
}

export const useGetExam = (
  examId: string,
  options?: Omit<UseQueryOptions<GetExamResponse>, 'queryKey' | 'queryFn'>
) => {
  return ExamService.useGet<GetExamResponse>({
    url: `/${examId}`,
    options
  })
}

export interface UpdateExamRequest {
  title: string
  durationMinutes: number
  startTime: string
  endTime: string
  status: string
  courseId: string
  rateScore: number
  questions: CreateExamQuestionRequest[]
}

export interface UpdateExamResponse {
  success: boolean
  data: {
    exam: ExamEntity
  }
  message: string
}

export interface UpdateExamVariables {
  examId: string
  data: UpdateExamRequest
}

export const useUpdateExam = (
  options?: Omit<
    UseMutationOptions<
      UpdateExamResponse,
      unknown,
      UpdateExamVariables,
      unknown
    >,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: async ({ examId, data }: UpdateExamVariables) => {
      return ExamService.apiMethod.put<UpdateExamResponse>({
        url: `/${examId}`,
        data
      })
    },
    ...options
  })
}

export interface ExamsResponse {
  success: boolean
  data: {
    exams: ExamSummaryEntity[]
  }
  message: string
}

export const useExams = (
  teacherId: string,
  options?: Omit<UseQueryOptions<ExamsResponse>, 'queryKey' | 'queryFn'>
) => {
  return ExamService.useGet<ExamsResponse>({
    url: `/teacher/${teacherId}`,
    options
  })
}

export const useExamResults = (
  examId: string,
  options?: Omit<UseQueryOptions<ExamResultsResponse>, 'queryKey' | 'queryFn'>
) => {
  return ExamService.useGet<ExamResultsResponse>({
    url: `/${examId}/results`,
    options
  })
}
