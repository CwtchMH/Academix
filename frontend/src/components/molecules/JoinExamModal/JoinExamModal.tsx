// src/components/molecules/JoinExamModal/JoinExamModal.tsx

'use client';

import { useEffect } from 'react';

interface JoinExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinExamModal = ({ isOpen, onClose }: JoinExamModalProps) => {
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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div
        id="join-exam-modal"
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--dark-text)]">
                Join Exam by Code
              </h2>
              <button
                className="text-[var(--medium-text)] hover:text-[var(--dark-text)]"
                onClick={onClose}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="mt-4">
              <label
                htmlFor="exam-code"
                className="block text-sm font-medium text-[var(--medium-text)]"
              >
                Enter Exam Code
              </label>
              <input
                type="text"
                name="exam-code"
                id="exam-code"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                placeholder="e.g., EXAM12345"
              />
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--medium-text)] bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button className="btn-primary px-4 py-2 text-sm font-medium rounded-md shadow-sm">
              Join Exam
            </button>
          </div>
        </div>
      </div>
    </>
  );
};