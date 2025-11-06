'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamResultStore } from '@/stores/examResult.store';

export default function ExamResultPage() {
  const router = useRouter();
  // Lấy state từ store
  const result = useExamResultStore((state) => state.result);
  const clearResult = useExamResultStore((state) => state.clearResult);

  const [isClient, setIsClient] = useState(false);
  const [formattedDate, setFormattedDate] = useState('...');

  // Effect 1: Đánh dấu là đã ở client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect 2: Xử lý chuyển hướng (nếu F5 hoặc vào trực tiếp)
  useEffect(() => {
    if (isClient && !result) {
      router.replace('/dashboard/student/exams');
    }
  }, [isClient, result, router]);

  // Effect 3: Format ngày tháng an toàn (chống hydration)
  useEffect(() => {
    if (isClient && result) {
      const formatted = new Date(result.dateTaken).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setFormattedDate(formatted);
    }
  }, [isClient, result]);

  // Effect 4: Dọn dẹp store (chỉ lên lịch dọn dẹp KHI đã ở client)
  useEffect(() => {
    if (isClient) {
      return () => {
        clearResult();
      };
    }
  }, [isClient, clearResult]);

  // Chống hydration: Server và Client CÙNG render "Loading..."
  if (!isClient || !result) {
    return <div className="p-8 text-center">Loading results...</div>;
  }

  // --- Render giao diện (khi đã an toàn) ---
  const isPassed = result.result === 'Passed';

  return (
    <div className="bg-gray-50 min-h-full p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[var(--dark-text)]">
            Detailed Exam Results
          </h1>
          <p className="mt-1 text-lg text-[var(--medium-text)]">
            A summary of your performance in the recent exam.
          </p>
        </div>

        {/* Khung kết quả */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Thông tin bài thi */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-[var(--dark-text)] mb-6">
              Exam Information
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-base font-medium text-[var(--medium-text)]">
                  Exam Title
                </span>
                <span className="text-base font-semibold text-[var(--dark-text)]">
                  {result.examTitle}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-base font-medium text-[var(--medium-text)]">
                  Course
                </span>
                <span className="text-base font-semibold text-[var(--dark-text)]">
                  {result.courseName}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="text-base font-medium text-[var(--medium-text)]">
                  Date Taken
                </span>
                <span className="text-base font-semibold text-[var(--dark-text)]">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Cột 2: Tổng quan */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-[var(--dark-text)] mb-4">
              Overall Result
            </h2>
            <p className="text-5xl font-bold text-[var(--dark-text)]">
              {result.correctAnswers}
              <span className="text-3xl text-gray-400">
                / {result.totalQuestions}
              </span>
            </p>
            <p className="text-base text-[var(--medium-text)] mt-1">
              Correct Answers
            </p>
            <span
              className={`mt-6 text-2xl font-semibold ${
                isPassed ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {result.result}
            </span>
            {isPassed && (
              <button
                // onClick={() => router.push(`/certificates/${result.submissionId}`)}
                className="btn-primary w-full flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm mt-8"
              >
                {/* <span className="material-symbols-outlined text-base">
                  workspace_premium
                </span> */}
                View Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
