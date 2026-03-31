import React from 'react';
import { requireNativeComponent, StyleSheet, ViewStyle } from 'react-native';

interface AvatarViewProps {
  name: string;
  style?: ViewStyle;
}

const NativeAvatarView = requireNativeComponent<AvatarViewProps>('AvatarView');

const AvatarView: React.FC<AvatarViewProps> = ({ name, style }) => {
  return (
    <NativeAvatarView
      name={name}
      style={[styles.avatar, style]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
  },
});

export default AvatarView;