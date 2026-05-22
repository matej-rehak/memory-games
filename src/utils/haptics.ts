import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  success: () => {
    if (!supported) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: () => {
    if (!supported) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  light: () => {
    if (!supported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    if (!supported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  selection: () => {
    if (!supported) return;
    Haptics.selectionAsync();
  },
};
