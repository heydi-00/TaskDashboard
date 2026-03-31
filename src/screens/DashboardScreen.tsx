import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import TaskItem from '../components/TaskItem';
import { FilterType } from '../types';
import TaskModel from '../database/models/Task';
import AvatarView from '../components/AvatarView'; 

const DashboardScreen: React.FC = () => {
  const {
        tasks,
        filter,
        isLoading,
        loadTasksFromDB,
        syncTasksFromAPI,
        toggleTask,
        setFilter,
        attachPhoto,
    } = useTaskStore();

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await loadTasksFromDB();
    if (tasks.length === 0) {
      await syncTasksFromAPI();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Completadas', value: 'completed' },
    { label: 'Pendientes', value: 'pending' },
  ];

  return (
    <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>📋 Mis Tareas</Text>
            <AvatarView name="Santiago Lopez" style={styles.avatar} />
        </View>
        <Text style={styles.headerSubtitle}>
            {filteredTasks.length} tareas
        </Text>
        </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterBtn,
              filter === f.value && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[
              styles.filterText,
              filter === f.value && styles.filterTextActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      {isLoading && tasks.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando tareas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={toggleTask}
            onAttachPhoto={attachPhoto}
          />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={syncTasksFromAPI}
              colors={['#4CAF50']}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay tareas</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  headerTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
 },
  avatar: {
  width: 48,
  height: 48,
 },
});

export default DashboardScreen;