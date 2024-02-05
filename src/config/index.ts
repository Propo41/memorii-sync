import { NativeModules, Platform } from 'react-native';
import { toSize } from '../helpers/scaling';
import i18n from './i18n';
const { StatusBarManager } = NativeModules;

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : Platform.OS === 'web' ? 20 : StatusBarManager.HEIGHT;

export const margins = {
  window_hor: toSize(12),
  window_vert: STATUSBAR_HEIGHT,
  window_hor_w_icon: toSize(10),
};

export const iconSize = {
  sm: 25,
  md: 30,
  lg: 50,
};

export type Language = 'English' | 'Bangla';

export const LANGUAGE_CODE: Record<string, string> = {
  English: 'EN',
  Bangla: 'BN',
};

export { i18n };
