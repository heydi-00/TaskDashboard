import { ApiResponse, Task } from '../types';

const BASE_URL = 'https://dummyjson.com';

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await fetch(`${BASE_URL}/todos`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data: ApiResponse = await response.json();
    return data.todos;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};