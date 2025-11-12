// src/components/molecules/CompletedExamCard.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamResultStore } from '@/stores/examResult.store';
import { ExamService } from '@/services'; // Import service
import type { CompletedExamResponse } from '@/services/types/api.types';
import type { SubmissionResult } from '@/app/(privateLayout)/dashboard/student/exams/types/exam.types';

interface CompletedExamCardProps {
  exam: CompletedExamResponse;
}

export const CompletedExamCard = ({ exam }: CompletedExamCardProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setResult = useExamResultStore((state) => state.setResult);

  const isPassed = exam.result === 'Passed';

  const handleViewResult = async () => {
    setIsLoading(true);
    try {
      // Gọi API mới để lấy chi tiết kết quả
      const resultData = await ExamService.apiMethod.get<SubmissionResult>({
        url: `/submissions/${exam.submissionId}/result`,
      });
      // Lưu vào store
      setResult(resultData);
      // Chuyển trang
      router.push(`/dashboard/student/exams/${exam.examPublicId}/result`);
    } catch (error) {
      console.error('Failed to fetch exam result:', error);
      alert('Could not load exam result.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-[var(--dark-text)]">
          {exam.examTitle}
        </h3>
        <p className="text-sm text-[var(--medium-text)] mt-1">
          {exam.courseName}
        </p>
        <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-[var(--medium-text)]">
          <div className="flex items-center gap-2">
            {/* <span className="material-symbols-outlined text-lg">event_available</span> */}
            <span>
              Submitted:{' '}
              {new Date(exam.submittedAt).toLocaleDateString('en-US')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="material-symbols-outlined text-lg">emoji_events</span> */}
            <span className="font-semibold text-[var(--dark-text)]">
              Score: {exam.score.toFixed(0)}%
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
              isPassed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {exam.result}
          </span>
        </div>
      </div>
      <button
        onClick={handleViewResult}
        disabled={isLoading}
        className="btn-primary !text-white flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm"
      >
        {/* <span className="material-symbols-outlined text-base">visibility</span> */}
        <span className="truncate">
          {isLoading ? 'Loading...' : 'View Result'}
        </span>
      </button>
    </div>
  );
};