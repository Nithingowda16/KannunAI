export type ChecklistActionType = 'Review' | 'Clarify' | 'Negotiate' | 'Confirm' | 'Ask a Lawyer';
export type ImportanceLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  category: string;
  actionType?: ChecklistActionType;
  itemText?: string;
  label?: string;
  description?: string;
  importance: ImportanceLevel;
  isChecked: boolean;
  isCompleted?: boolean;
  clauseId?: string;
  sourceSection?: string;
  pageNumber?: number;
  linkedFinding?: string;
}
