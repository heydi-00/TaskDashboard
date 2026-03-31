import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import TaskItem from '../components/TaskItem';
import { FilterType } from '../types';
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    initApp();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
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

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  const filters: { label: string; value: FilterType; emoji: string }[] = [
    { label: 'Todas', value: 'all', emoji: '📋' },
    { label: 'Listas', value: 'completed', emoji: '✅' },
    { label: 'Pendientes', value: 'pending', emoji: '⏳' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      {/* Header animado */}
      <Animated.View style={[
        styles.header,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bienvenida 👋</Text>
            <Text style={styles.headerTitle}>Mis Tareas</Text>
          </View>
          <AvatarView name="Santiago Lopez" style={styles.avatar} />
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {completedCount} de {tasks.length} completadas
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} />
          </View>
        </View>
      </Animated.View>

      {/* Filtros */}
      <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterBtn,
              filter === f.value && styles.filterBtnActive,
            ]}
            onPress={() => setFilter(f.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[
              styles.filterText,
              filter === f.value && styles.filterTextActive,
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Lista */}
      {isLoading && tasks.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Cargando tareas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TaskItem
              task={item}
              onToggle={toggleTask}
              onAttachPhoto={attachPhoto}
              index={index}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={syncTasksFromAPI}
              colors={['#7c3aed']}
              tintColor="#7c3aed"
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>¡No hay tareas aquí!</Text>
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
    backgroundColor: '#0f0f1a',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#a78bfa',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  avatar: {
    width: 52,
    height: 52,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#a78bfa',
  },
  progressPercent: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d2d4e',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  filterBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#a78bfa',
    fontSize: 15,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#a78bfa',
  },
});

export default DashboardScreen;