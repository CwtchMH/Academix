// src/components/molecules/JoinExamModal.tsx
'use client';

import { useEffect } from 'react';
import type { Exam } from '@/app/(privateLayout)/dashboard/student/exams/types/exam.types';

interface JoinExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinSuccess: (examData: Exam) => void;
}

const mockExamData: Exam = {
  id: 'cs101',
  title: 'Introduction to Computer Science',
  courseCode: 'CS101',
  durationInMinutes: 90,
  startTime: new Date('2025-12-25T10:00:00'),
};

export const JoinExamModal = ({ isOpen, onClose, onJoinSuccess}: JoinExamModalProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleJoinExam = () => {
    // call API
    // Nếu API thành công, gọi onJoinSuccess với data trả về.
    console.log("Joining exam...");
    onJoinSuccess(mockExamData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
    <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
    />

      {/* Modal Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <h2 id="modal-title" className="text-2xl font-bold text-[var(--dark-text)]">
                Join Exam
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--medium-text)] hover:text-[var(--dark-text)] p-1 rounded-full hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">X</span>
              </button>
            </div>
            <div className="mt-6">
              <label
                htmlFor="exam-code"
                className="block text-sm font-medium text-[var(--medium-text)] mb-1"
              >
                Exam Code
              </label>
              <input
                type="text"
                name="exam-code"
                id="exam-code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] sm:text-base p-3"
                placeholder="Enter the exam code"
              />
            </div>
          </div>
          <div className="bg-gray-50 px-8 py-4 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-2 text-sm font-semibold rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinExam}
              className="btn-primary px-6 py-2 text-sm font-semibold rounded-md shadow-sm">
              Join Exam
            </button>
          </div>
        </div>
      </div>
    </>
  );
};