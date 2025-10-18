export interface ExamChoiceResponseDto {
  content: string;
  isCorrect: boolean;
}

export interface ExamQuestionResponseDto {
  id: string;
  content: string;
  answerQuestion: number;
  answer: ExamChoiceResponseDto[];
}

export interface ExamResponseDto {
  id: string;
  publicId: string;
  title: string;
  durationMinutes: number;
  startTime: Date;
  endTime: Date;
  status: string;
  courseId: string;
  rateScore: number;
  questions: ExamQuestionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}
