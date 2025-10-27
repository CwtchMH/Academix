"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExamService } from "@/services";
import { ConfirmSubmitModal } from "@/components/molecules/ConfirmSubmitModal/ConfirmSubmitModal";
import { useExamResultStore } from "@/stores/examResult.store";
import { SubmissionResult, SubmitExamPayload } from "../../types/exam.types";
import type {
  TakeExamQuestion,
  TakeExamResponse,
} from "../../types/exam.types";
import type { AxiosError } from "axios";
import axios from "axios";

type StudentAnswer = {
  questionId: string;
  selectedChoiceIndex: number | null;
};

interface ErrorResponse {
  message: string | string[];
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = params.publicId as string;

  // ⭐️ Lấy hàm setResult từ store
  const setResult = useExamResultStore((state) => state.setResult);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [examEndTime, setExamEndTime] = useState<string | null>(null);

  // ⭐️ 1. Hook để LẤY BÀI THI
  const {
    data: examData,
    isLoading: isExamLoading,
    error: examError,
  } = ExamService.useGet<TakeExamResponse>({
    url: `/${publicId}/take`,
    options: {
      enabled: !!publicId,
      retry: false,
    },
  });

  // Hook để NỘP BÀI THI
  const { mutate: submitExam, isPending: isSubmitting } =
    ExamService.usePost<SubmissionResult>(
      {
        url: `/${publicId}/submit`,
      },
      {
        onSuccess: (data) => {
          // LƯU KẾT QUẢ VÀ CHUYỂN TRANG
          setResult(data);
          router.push(`/dashboard/student/exams/${publicId}/result`);
        },
        onError: (error: unknown) => {
          // Type guard để kiểm tra AxiosError
          if (axios.isAxiosError(error)) {
            const err = error as AxiosError<ErrorResponse>;
            const message = err.response?.data?.message || "Submission failed.";
            alert(
              `Error: ${Array.isArray(message) ? message.join(", ") : message}`
            );
          } else {
            // Xử lý lỗi không phải từ Axios
            alert("An unexpected error occurred.");
          }
          setIsSubmitModalOpen(false);
        },
      }
    );

  // useEffect để khởi tạo đáp án và lưu endTime
  useEffect(() => {
    if (examData) {
      const initialAnswers = examData.questions.map((q) => ({
        questionId: q.questionId,
        selectedChoiceIndex: null,
      }));
      setStudentAnswers(initialAnswers);

            // Chỉ lưu chuỗi durationMinutes, KHÔNG tính toán ở đây
      setExamEndTime(examData.durationMinutes
        ? new Date(Date.now() + examData.durationMinutes * 60 * 1000).toISOString()
        : null
      );
    }
  }, [examData]);

  // Cập nhật hàm handleSubmit
  const handleSubmit = useCallback(
    (answersToSubmit: StudentAnswer[]) => {
      // Lọc và format payload đúng như API backend yêu cầu
      const payloadAnswers = answersToSubmit
        .filter((ans) => ans.selectedChoiceIndex !== null)
        .map((ans) => ({
          questionId: ans.questionId,
          answerNumber: ans.selectedChoiceIndex! + 1, // Convert (0-3) -> (1-4)
        }));

      // Gọi API nộp bài
      submitExam({
        data: {
          answers: payloadAnswers,
        },
      });
    },
    [submitExam]
  );

  // useEffect: Khởi tạo đồng hồ đếm ngược
  useEffect(() => {
    if (examEndTime) {
      const endTimeMs = new Date(examEndTime).getTime();
      const nowMs = new Date().getTime();
      const secondsLeft = Math.floor((endTimeMs - nowMs) / 1000);

      if (secondsLeft > 0) {
        setRemainingTime(secondsLeft);
      } else {
        setRemainingTime(0);
        handleSubmit(studentAnswers);
      }
    }
  }, [examEndTime, studentAnswers, handleSubmit]);

  // useEffect: Tick đồng hồ mỗi giây
  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime === null || prevTime <= 1) {
          clearInterval(timerId);
          handleSubmit(studentAnswers);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [remainingTime, studentAnswers, handleSubmit]);

  if (isExamLoading) {
    return <div className="p-8 text-center">Loading exam...</div>;
  }
  if (examError) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">Error loading exam</h2>
        <p>{(examError as any).message || "An unknown error occurred."}</p>
      </div>
    );
  }

  if (!examData) {
    return <div className="p-8 text-center">No exam data found.</div>;
  }

  const currentQuestion: TakeExamQuestion =
    examData.questions[currentQuestionIndex];
  const totalQuestions = examData.questions.length;

  const handleSelectChoice = (choiceIndex: number) => {
    const newAnswers = [...studentAnswers];
    newAnswers[currentQuestionIndex].selectedChoiceIndex = choiceIndex;
    setStudentAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <>
      <div className="flex justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          {/* Header bài thi */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold text-center text-[var(--dark-text)]">
              {examData.title}
            </h1>
            <p className="text-center text-sm text-[var(--medium-text)] mt-1">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>

            {/* Timer */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-[var(--medium-text)] mb-1">
                <span>Time Remaining:</span>
                <span className="font-bold text-[var(--primary-color)] text-base">
                  {remainingTime !== null ? formatTime(remainingTime) : "..."}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[var(--primary-color)] h-2.5 rounded-full transition-all"
                  style={{
                    width:
                      remainingTime !== null
                        ? `${
                            (1 -
                              remainingTime / (examData.durationMinutes * 60)) *
                            100
                          }%`
                        : "0%",
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Khung câu hỏi */}
          <div className="bg-white p-8 mt-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-semibold text-[var(--dark-text)] leading-relaxed">
              {currentQuestion.content}
            </p>

            {/* Các lựa chọn */}
            <div className="mt-6 space-y-4">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected =
                  studentAnswers[currentQuestionIndex]?.selectedChoiceIndex ===
                  index;

                return (
                  <label
                    key={index}
                    className={`block w-full p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-[var(--primary-color)] bg-blue-50 ring-2 ring-[var(--primary-color)]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.questionId}`}
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleSelectChoice(index)}
                    />
                    <div className="flex items-center">
                      <span
                        className={`w-5 h-5 inline-block mr-4 border rounded-full transition-all ${
                          isSelected
                            ? "border-[var(--primary-color)] bg-white"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="block w-3 h-3 bg-[var(--primary-color)] rounded-full m-0.5"></span>
                        )}
                      </span>
                      <span className="text-base text-[var(--medium-text)]">
                        {choice.content}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="btn-secondary flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm text-[var(--primary-color)] border-[var(--primary-color)] hover:bg-blue-50"
              >
                Submit Exam
              </button>
              <button
                onClick={goToNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="btn-primary flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nộp bài với isLoading từ API */}
      <ConfirmSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={() => handleSubmit(studentAnswers)}
        isLoading={isSubmitting}
      />
    </>
  );
}
