export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChecklistItem {
  id: string;
  category: string;
  itemText?: string;
  label?: string;
  description?: string;
  importance: ImportanceLevel;
  isChecked: boolean;
  isCompleted?: boolean;
  clauseId?: string;
  sourceSection?: string;
  pageNumber?: number;
}
