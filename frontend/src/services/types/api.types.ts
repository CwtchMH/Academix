// src/app/(privateLayout)/exams/types/api.types.ts
export type Exam = {
  id: string;
  title: string;
  courseCode: string;
  durationInMinutes: number;
  startTime: Date;
};

export interface JoinExamResponseDto {
  publicId: string;
  title: string;
  durationMinutes: number;
  startTime: string;
  course: {
    publicId: string;
    courseName: string;
  };
}