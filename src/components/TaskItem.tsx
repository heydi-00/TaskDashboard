import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import TaskModel from '../database/models/Task';

interface Props {
  task: TaskModel;
  onToggle: (task: TaskModel) => void;
  onAttachPhoto: (task: TaskModel) => void;
  index: number;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onAttachPhoto, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

      <View style={styles.content}>
        <Text style={[
          styles.title,
          task.completed && styles.titleCompleted
        ]}>
          {task.todo}
        </Text>

        {/* Foto adjunta o botón */}
        {task.attachmentUri ? (
          <TouchableOpacity
            onPress={() => onAttachPhoto(task)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: `file://${task.attachmentUri}` }}
              style={styles.thumbnail}
            />
            <Text style={styles.replaceText}>📷 Reemplazar foto</Text>
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

      <Switch
        value={task.completed}
        onValueChange={handleToggle}
        trackColor={{ false: '#2d2d4e', true: '#7c3aed' }}
        thumbColor={task.completed ? '#ffffff' : '#a78bfa'}
      />
    </Animated.View>
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
  title: {
    fontSize: 15,
    color: '#e2e8f0',
    marginBottom: 8,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#4a4a6a',
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
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginBottom: 4,
  },
  replaceText: {
    fontSize: 11,
    color: '#7c3aed',
  },
});

export default TaskItem;