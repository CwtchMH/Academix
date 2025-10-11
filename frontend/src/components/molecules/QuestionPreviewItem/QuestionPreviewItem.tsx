import React from 'react'
import { Icon } from '@/components/atoms'
import type { QuestionPreviewItemProps } from './QuestionPreviewItem.types'

/**
 * Render a single question row inside the Live Exam Preview list.
 */
export const QuestionPreviewItem: React.FC<QuestionPreviewItemProps> = ({
  index,
  question,
  onEdit,
  onDelete,
  onToggleCollapse,
  isExpanded = false
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 text-slate-300 transition hover:text-slate-500"
            aria-label="Reorder question"
          >
            <Icon name="drag" />
          </button>
          <p className="text-sm font-medium leading-relaxed text-slate-900">
            <span className="mr-2 font-semibold text-slate-500">{index}.</span>
            {question}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Edit question"
          >
            <Icon name="edit" size="small" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Remove question"
          >
            <Icon name="trash" size="small" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label={isExpanded ? 'Collapse question' : 'Expand question'}
          >
            <Icon
              name="chevron-down"
              className={
                isExpanded ? 'rotate-180 transform transition' : 'transition'
              }
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-10">
          <p className="text-sm text-slate-500">
            Question details will appear here once connected to live data.
          </p>
        </div>
      )}
    </div>
  )
}
