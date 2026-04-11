import React, { useEffect, useRef, useState } from 'react';
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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTaskStore } from '../store/taskStore';
import TaskItem from '../components/TaskItem';
import { FilterType } from '../types';
import AvatarView from '../components/AvatarView';
import { database } from '../database';

const DashboardScreen: React.FC = () => {
  const {
    tasks,
    filter,
    isLoading,
    searchQuery,
    loadTasksFromDB,
    syncTasksFromAPI,
    toggleTask,
    setFilter,
    attachPhoto,
    createTask,
    deleteTask,
    setSearchQuery,
  } = useTaskStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

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
    const tasksCollection = database.get('tasks');
    const existingTasks = await tasksCollection.query().fetch();
    if (existingTasks.length === 0) {
      await syncTasksFromAPI();
    } else {
      await loadTasksFromDB();
    }
  };

  const handleCreateTask = async () => {
    if (newTaskText.trim() === '') return;
    await createTask(newTaskText.trim());
    setNewTaskText('');
    setModalVisible(false);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .filter(task =>
      task.todo.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <Text style={styles.headerTitle}>TaskFlow ✨</Text>
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
            <View style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} />
          </View>
        </View>
      </Animated.View>

      {/* Barra de búsqueda */}
      <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar tarea..."
          placeholderTextColor="#4a4a6a"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
              onDelete={deleteTask}
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
              <Text style={styles.emptyEmoji}>
                {searchQuery ? '🔍' : '🎉'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No se encontraron tareas' : '¡No hay tareas aquí!'}
              </Text>
            </View>
          }
        />
      )}

      {/* Botón flotante crear tarea */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal crear tarea */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✨ Nueva Tarea</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="¿Qué necesitas hacer?"
              placeholderTextColor="#4a4a6a"
              value={newTaskText}
              onChangeText={setNewTaskText}
              multiline
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setNewTaskText('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.createBtn,
                  !newTaskText.trim() && styles.createBtnDisabled
                ]}
                onPress={handleCreateTask}
                disabled={!newTaskText.trim()}
              >
                <Text style={styles.createBtnText}>Crear ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#e2e8f0',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
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
    paddingBottom: 100,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#0f0f1a',
    borderRadius: 14,
    padding: 16,
    color: '#e2e8f0',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2d2d4e',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0f0f1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  cancelBtnText: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '500',
  },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#2d2d4e',
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;