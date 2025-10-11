'use client'

import React, { useMemo, useState } from 'react'
import { Button, Icon, Input, Textarea } from '@/components/atoms'
import { QuestionPreviewItem } from '@/components/molecules'
import {
  FinalizeExamModal,
  type FinalizeExamFormValues
} from '@/components/organisms'

interface AnswerChoiceDraft {
  id: string
  text: string
}

interface ExamQuestion {
  id: string
  prompt: string
  choices: AnswerChoiceDraft[]
  correctChoiceId?: string | null
}

const defaultChoices = (): AnswerChoiceDraft[] => [
  { id: 'choice-1', text: '' },
  { id: 'choice-2', text: '' },
  { id: 'choice-3', text: '' },
  { id: 'choice-4', text: '' }
]

const initialQuestions: ExamQuestion[] = [
  {
    id: 'question-1',
    prompt: 'What is the powerhouse of the cell?',
    choices: [],
    correctChoiceId: null
  },
  {
    id: 'question-2',
    prompt: 'Which planet is known as the Red Planet?',
    choices: [],
    correctChoiceId: null
  },
  {
    id: 'question-3',
    prompt: 'What is the chemical symbol for Gold?',
    choices: [],
    correctChoiceId: null
  }
]

const courseOptions = [
  { label: 'Biology 101', value: 'bio-101' },
  { label: 'Chemistry 201', value: 'chem-201' },
  { label: 'Astronomy 105', value: 'astro-105' }
]

export default function CreateTeacherExamPage() {
  const [examTitle, setExamTitle] = useState(
    'Mid-Term Biology Exam (AI Generated)'
  )
  const [questionContent, setQuestionContent] = useState('')
  const [choiceDrafts, setChoiceDrafts] = useState<AnswerChoiceDraft[]>(
    defaultChoices()
  )
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>(initialQuestions)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  )
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  )
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalQuestions = useMemo(() => questions.length, [questions])

  const handleChoiceChange = (choiceId: string, text: string) => {
    setChoiceDrafts((prev) =>
      prev.map((choice) =>
        choice.id === choiceId ? { ...choice, text } : choice
      )
    )
  }

  const resetBuilder = () => {
    setQuestionContent('')
    setChoiceDrafts(defaultChoices())
    setSelectedChoiceId(null)
    setEditingQuestionId(null)
  }

  const handleAddQuestion = () => {
    if (!questionContent.trim()) return

    const choicePayload = choiceDrafts.filter((choice) => choice.text.trim())
    const correctChoiceId = choicePayload.some(
      (choice) => choice.id === selectedChoiceId
    )
      ? selectedChoiceId
      : null
    const payload: ExamQuestion = {
      id: editingQuestionId ?? `question-${Date.now()}`,
      prompt: questionContent.trim(),
      choices: choicePayload,
      correctChoiceId
    }

    setQuestions((prev) => {
      if (editingQuestionId) {
        return prev.map((question) =>
          question.id === editingQuestionId ? payload : question
        )
      }
      return [...prev, payload]
    })

    resetBuilder()
  }

  const handleEditQuestion = (question: ExamQuestion) => {
    setEditingQuestionId(question.id)
    setQuestionContent(question.prompt)
    setChoiceDrafts(
      question.choices.length > 0 ? question.choices : defaultChoices()
    )
    setSelectedChoiceId(question.correctChoiceId ?? null)
    setExpandedQuestionId(question.id)
  }

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId)
    )
    if (editingQuestionId === questionId) {
      resetBuilder()
    }
  }

  const handleToggleExpand = (questionId: string) => {
    setExpandedQuestionId((prev) => (prev === questionId ? null : questionId))
  }

  const handleGenerateAi = () => {
    // Future: replace with actual AI generation logic
    setQuestionContent(
      'Describe the process of photosynthesis and its stages in plant cells.'
    )
  }

  const buildExamPayload = () => ({
    title: examTitle.trim(),
    questions: questions.map((question, index) => ({
      order: index + 1,
      prompt: question.prompt,
      choices: question.choices,
      correctChoiceId: question.correctChoiceId
    }))
  })

  const handleSaveExamClick = () => {
    setIsFinalizeModalOpen(true)
  }

  const handleFinalizeExamSubmit = async (
    finalizeValues: FinalizeExamFormValues
  ) => {
    const payload = {
      ...buildExamPayload(),
      schedule: finalizeValues
    }

    setIsSubmitting(true)

    try {
      // TODO: replace with actual API call
      void payload
      setIsFinalizeModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <React.Fragment>
      <div className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Create New Exam
            </h1>
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSaveExamClick}
            className="self-start md:self-auto"
          >
            <span className="flex items-center gap-2">
              <Icon name="save" size="small" />
              Save Exam
            </span>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Question Builder
              </h2>
              <Button
                size="small"
                variant="consensus"
                onClick={handleGenerateAi}
              >
                <span className="flex items-center gap-2">
                  <Icon name="ai" size="small" />
                  Generate with AI
                </span>
              </Button>
            </div>

            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-600"
                  htmlFor="question-content"
                >
                  Question Content
                </label>
                <Textarea
                  id="question-content"
                  placeholder="Enter question content here"
                  value={questionContent}
                  onChange={setQuestionContent}
                  rows={5}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600">
                  Answer Choices
                </p>
                <div className="space-y-3">
                  {choiceDrafts.map((choice, index) => (
                    <label
                      key={choice.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-blue-200"
                    >
                      <input
                        type="radio"
                        name="answer-choice"
                        checked={selectedChoiceId === choice.id}
                        onChange={() => setSelectedChoiceId(choice.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <Input
                        placeholder={`Answer Choice ${index + 1}`}
                        value={choice.text}
                        onChange={(value) =>
                          handleChoiceChange(choice.id, value)
                        }
                        className="flex-1"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button
                htmlType="button"
                size="large"
                variant="primary"
                fullWidth
                onClick={handleAddQuestion}
              >
                {editingQuestionId
                  ? 'Update Question'
                  : 'Add Question to Preview'}
              </Button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-600"
                  htmlFor="exam-title"
                >
                  Exam Title
                </label>
                <Input
                  id="exam-title"
                  value={examTitle}
                  onChange={setExamTitle}
                  placeholder="Enter exam title"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Live Exam Preview
                  </h2>
                  <span className="text-sm text-slate-500">
                    {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3">
                  {questions.length > 0 ? (
                    <>
                      {questions.map((question, index) => (
                        <QuestionPreviewItem
                          key={question.id}
                          index={index + 1}
                          question={question.prompt}
                          onEdit={() => handleEditQuestion(question)}
                          onDelete={() => handleDeleteQuestion(question.id)}
                          onToggleCollapse={() =>
                            handleToggleExpand(question.id)
                          }
                          isExpanded={expandedQuestionId === question.id}
                        />
                      ))}
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
                        New questions will appear here
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
                      New questions will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <FinalizeExamModal
        open={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        onSubmit={handleFinalizeExamSubmit}
        courseOptions={courseOptions}
        loading={isSubmitting}
      />
    </React.Fragment>
  )
}
