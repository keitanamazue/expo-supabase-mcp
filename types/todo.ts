export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Category = 'work' | 'personal' | 'shopping' | 'health' | 'other';

export interface Todo {
  id: string;
  user_id: string | null;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: Priority;
  category: Category;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoInsert {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  category?: Category;
  due_date?: string;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
  category?: Category;
  due_date?: string | null;
}

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'created' | 'priority' | 'due_date' | 'title';

