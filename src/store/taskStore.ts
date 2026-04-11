import { create } from 'zustand';
import { database } from '../database';
import { fetchTasks } from '../api/taskService';
import TaskModel from '../database/models/Task';
import { FilterType } from '../types';
import { NativeModules } from 'react-native';

const { CameraModule } = NativeModules;

interface TaskStore {
  tasks: TaskModel[];
  filter: FilterType;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  loadTasksFromDB: () => Promise<void>;
  syncTasksFromAPI: () => Promise<void>;
  toggleTask: (task: TaskModel) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  attachPhoto: (task: TaskModel) => Promise<void>;
  createTask: (todo: string) => Promise<void>;
  deleteTask: (task: TaskModel) => Promise<void>;
  setSearchQuery: (query: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filter: 'all',
  isLoading: false,
  error: null,
  searchQuery: '',

  loadTasksFromDB: async () => {
    try {
      set({ isLoading: true });
      const tasksCollection = database.get<TaskModel>('tasks');
      const tasks = await tasksCollection.query().fetch();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: 'Error loading tasks', isLoading: false });
    }
  },

  syncTasksFromAPI: async () => {
    try {
      set({ isLoading: true });
      const apiTasks = await fetchTasks();
      await database.write(async () => {
        const tasksCollection = database.get<TaskModel>('tasks');
        const existingTasks = await tasksCollection.query().fetch();

        const actions = apiTasks.map(apiTask => {
          const existing = existingTasks.find(
            t => t.remoteId === String(apiTask.id)
          );
          if (existing) {
            return existing.prepareUpdate((record: TaskModel) => {
              record.todo = apiTask.todo;
            });
          } else {
            return tasksCollection.prepareCreate((record: TaskModel) => {
              record.remoteId = String(apiTask.id);
              record.todo = apiTask.todo;
              record.completed = apiTask.completed;
              record.userId = apiTask.userId;
              record.attachmentUri = '';
            });
          }
        });
        await database.batch(...actions);
      });
      await get().loadTasksFromDB();
    } catch (error) {
      set({ error: 'Error syncing tasks', isLoading: false });
    }
  },

  toggleTask: async (task: TaskModel) => {
    await database.write(async () => {
      await task.update((record: TaskModel) => {
        record.completed = !record.completed;
      });
    });
    await get().loadTasksFromDB();
  },

  setFilter: (filter: FilterType) => set({ filter }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  createTask: async (todo: string) => {
    try {
      await database.write(async () => {
        const tasksCollection = database.get<TaskModel>('tasks');
        await tasksCollection.create((record: TaskModel) => {
          record.remoteId = `local_${Date.now()}`;
          record.todo = todo;
          record.completed = false;
          record.userId = 0;
          record.attachmentUri = '';
        });
      });
      await get().loadTasksFromDB();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  },

  deleteTask: async (task: TaskModel) => {
    try {
      await database.write(async () => {
        await task.destroyPermanently();
      });
      await get().loadTasksFromDB();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  },

  attachPhoto: async (task: TaskModel) => {
    try {
      const result = await CameraModule.takePhoto();
      if (result && result.uri) {
        await database.write(async () => {
          await task.update((record: TaskModel) => {
            record.attachmentUri = result.uri;
          });
        });
        await get().loadTasksFromDB();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  },
}));