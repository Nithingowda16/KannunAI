export interface ChecklistItem {
  id: string;
  category: 'Financial' | 'Termination' | 'Liability' | 'IP' | 'Privacy' | 'General';
  label: string;
  description: string;
  isCompleted: boolean;
  clauseId?: string;
  sourceSection?: string;
  pageNumber?: number;
}
