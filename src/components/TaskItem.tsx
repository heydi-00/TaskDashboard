import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import TaskModel from '../database/models/Task';

interface Props {
  task: TaskModel;
  onToggle: (task: TaskModel) => void;
  onAttachPhoto: (task: TaskModel) => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onAttachPhoto }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[
          styles.title,
          task.completed && styles.completed
        ]}>
          {task.todo}
        </Text>

        {/* Miniatura de foto si existe */}
        {task.attachmentUri ? (
          <TouchableOpacity onPress={() => onAttachPhoto(task)}>
            <Image
              source={{ uri: `file://${task.attachmentUri}` }}
              style={styles.thumbnail}
            />
            <Text style={styles.replaceText}>Reemplazar foto</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => onAttachPhoto(task)}
          >
            <Text style={styles.cameraBtnText}>📷 Adjuntar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <Switch
        value={task.completed}
        onValueChange={() => onToggle(task)}
        trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
        thumbColor={task.completed ? '#fff' : '#fff'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  cameraBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  cameraBtnText: {
    fontSize: 12,
    color: '#555',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 4,
  },
  replaceText: {
    fontSize: 11,
    color: '#4CAF50',
  },
});

export default TaskItem;