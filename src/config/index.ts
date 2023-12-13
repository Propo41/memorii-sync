import { toSize } from '../helpers/scaling';
import { Platform, NativeModules } from 'react-native';
const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT =
  Platform.OS === 'ios' ? 20 : Platform.OS === 'web' ? 20 : StatusBarManager.HEIGHT;

export const margins = {
  window_hor: toSize(25),
  window_vert: STATUSBAR_HEIGHT,
};