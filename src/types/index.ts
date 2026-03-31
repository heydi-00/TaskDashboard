export interface Task {
  id: string;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface ApiResponse {
  todos: Task[];
  total: number;
  skip: number;
  limit: number;
}

export type FilterType = 'all' | 'completed' | 'pending';