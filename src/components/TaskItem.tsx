import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TaskModel from '../database/models/Task';

interface Props {
  task: TaskModel;
  onToggle: (task: TaskModel) => void;
  onAttachPhoto: (task: TaskModel) => void;
  onDelete: (task: TaskModel) => void;
  onEdit: (task: TaskModel, newTodo: string) => void;
  index: number;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onAttachPhoto, onDelete, onEdit, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState(task.todo);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(task);
  };

  return (
    <>
      {/* Modal visor de imagen */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalImageTitle} numberOfLines={2}>
            {task.todo}
          </Text>
          <Image
            source={{ uri: `file://${task.attachmentUri}` }}
            style={styles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.replaceBtn}
            onPress={() => {
              setModalVisible(false);
              onAttachPhoto(task);
            }}
          >
            <Text style={styles.replaceBtnText}>📷 Reemplazar foto</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal editar tarea */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editModalOverlay}
        >
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>✏️ Editar Tarea</Text>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
              placeholderTextColor="#4a4a6a"
            />
            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !editText.trim() && styles.saveBtnDisabled
                ]}
                onPress={() => {
                  if (editText.trim()) {
                    onEdit(task, editText.trim());
                    setEditModalVisible(false);
                  }
                }}
                disabled={!editText.trim()}
              >
                <Text style={styles.saveBtnText}>Guardar ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Tarjeta de tarea */}
      <Animated.View style={[
        styles.container,
        task.completed && styles.containerCompleted,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}>
        {/* Indicador lateral */}
        <View style={[
          styles.indicator,
          task.completed && styles.indicatorCompleted
        ]} />

        {/* Contenido */}
        <View style={styles.content}>

          {/* Fila título + botones */}
          <View style={styles.titleRow}>
            <Text style={[
              styles.title,
              task.completed && styles.titleCompleted
            ]}>
              {task.todo}
            </Text>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                onPress={() => {
                  setEditText(task.todo);
                  setEditModalVisible(true);
                }}
                style={styles.editBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(task)}
                style={styles.deleteBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteBtnText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Foto o botón cámara */}
          {task.attachmentUri && task.attachmentUri.length > 0 ? (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              style={styles.thumbnailContainer}
            >
              <Image
                source={{ uri: `file://${task.attachmentUri}` }}
                style={styles.thumbnail}
              />
              <View style={styles.viewOverlay}>
                <Text style={styles.viewOverlayText}>👁 Ver foto</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => onAttachPhoto(task)}
              activeOpacity={0.7}
            >
              <Text style={styles.cameraBtnText}>📷 Adjuntar foto</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* Switch */}
        <Switch
          value={task.completed}
          onValueChange={handleToggle}
          trackColor={{ false: '#2d2d4e', true: '#7c3aed' }}
          thumbColor={task.completed ? '#ffffff' : '#a78bfa'}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  containerCompleted: {
    borderColor: '#7c3aed',
    backgroundColor: '#16162a',
  },
  indicator: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: '#2d2d4e',
  },
  indicatorCompleted: {
    backgroundColor: '#7c3aed',
  },
  content: {
    flex: 1,
    padding: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    marginRight: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#4a4a6a',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  editBtn: {
    padding: 4,
  },
  editBtnText: {
    fontSize: 14,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  cameraBtn: {
    backgroundColor: '#0f0f1a',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  cameraBtnText: {
    fontSize: 11,
    color: '#a78bfa',
  },
  thumbnailContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  viewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 3,
    alignItems: 'center',
  },
  viewOverlayText: {
    fontSize: 9,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#1a1a2e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImageTitle: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 70,
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '500',
  },
  fullImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
  replaceBtn: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  replaceBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  editModalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  editInput: {
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
  editModalButtons: {
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
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#2d2d4e',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default TaskItem;