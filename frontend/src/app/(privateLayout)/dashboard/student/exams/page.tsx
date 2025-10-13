// src/app/(privateLayout)/exams/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { JoinExamModal } from '@/components/molecules/JoinExamModal/JoinExamModal';
import { ExamCard } from '@/components/molecules/ExamCard/ExamCard';
import { ConfirmStartExamModal } from '@/components/molecules/ConfirmStartExamModal/ConfirmStartExamModal';
import type { Exam } from './types/exam.types';

export default function ExamsPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const router = useRouter();

  const handleJoinSuccess = (newExam: Exam) => {
    if (!upcomingExams.find(exam => exam.id === newExam.id)) {
      setUpcomingExams(prevExams => [...prevExams, newExam]);
    }
  };

  const handleStartExamClick = (exam: Exam) => {
    setSelectedExam(exam);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStart = () => {
    if (!selectedExam) return;

    console.log(`Starting exam: ${selectedExam.title} (ID: ${selectedExam.id})`);
    router.push(`/exams/${selectedExam.id}/take`);

    setIsConfirmModalOpen(false);
    setSelectedExam(null);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--dark-text)]">
            Exams
          </h2>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="btn-primary flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm"
          >
            {/* <span className="material-symbols-outlined text-base">add_circle</span> */}
            <span className="truncate">Join Exam by Code</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav aria-label="Tabs" className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`whitespace-nowrap py-4 px-1 text-sm ${
                activeTab === 'upcoming' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`whitespace-nowrap py-4 px-1 text-sm ${
                activeTab === 'completed' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingExams.length > 0 ? (
                upcomingExams.map(exam => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    onStartClick={handleStartExamClick}
                  />
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-white rounded-lg border border-dashed border-gray-300">
                  <div className="mx-auto h-20 w-20 text-[var(--primary-color)] opacity-50">
                    <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--dark-text)]">No upcoming exams</h3>
                  <p className="mt-1 text-sm text-[var(--medium-text)]">
                    You currently have no scheduled exams. When an exam is scheduled, it will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'completed' && (
              <div className="text-center py-12 px-4 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-[var(--medium-text)]">You have no completed exams.</p>
            </div>
          )}
        </div>
      </div>

      {/* Render Modals */}
      <JoinExamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={handleJoinSuccess}
      />

      <ConfirmStartExamModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmStart}
        exam={selectedExam}
      />
    </>
  );
}