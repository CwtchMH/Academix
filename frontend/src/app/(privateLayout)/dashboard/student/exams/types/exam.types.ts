export type Exam = {
  id: string;
  title: string;
  courseCode: string;
  durationInMinutes: number;
  startTime: Date;
};

/**
 * DTO cho một lựa chọn câu hỏi (đã lọc đáp án)
 * Khớp với TakeExamChoiceDto
 */
export interface TakeExamChoice {
  content: string;
}

/**
 * DTO cho một câu hỏi (đã lọc đáp án)
 * Khớp với TakeExamQuestionDto
 */
export interface TakeExamQuestion {
  questionId: string;
  content: string;
  choices: TakeExamChoice[];
}
/**
 * DTO response cho API "GET /exams/:publicId/take"
 * Khớp với TakeExamResponseDto
 */
export interface TakeExamResponse {
  publicId: string;
  title: string;
  durationMinutes: number;
  endTime: string;
  questions: TakeExamQuestion[];
}