export interface QuestionPreviewItemProps {
  index: number
  question: string
  onEdit?: () => void
  onDelete?: () => void
  onToggleCollapse?: () => void
  isExpanded?: boolean
}
