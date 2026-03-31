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
  loadTasksFromDB: () => Promise<void>;
  syncTasksFromAPI: () => Promise<void>;
  toggleTask: (task: TaskModel) => Promise<void>;
  setFilter: (filter: FilterType) => void;
  attachPhoto: (task: TaskModel) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filter: 'all',
  isLoading: false,
  error: null,

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
        const deleteActions = existingTasks.map(t => t.prepareDestroyPermanently());
        const createActions = apiTasks.map(task =>
          tasksCollection.prepareCreate((record: TaskModel) => {
            record.remoteId = String(task.id);
            record.todo = task.todo;
            record.completed = task.completed;
            record.userId = task.userId;
            record.attachmentUri = '';
          })
        );
        await database.batch(...deleteActions, ...createActions);
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