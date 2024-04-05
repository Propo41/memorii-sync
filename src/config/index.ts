import { NativeModules, Platform } from 'react-native';
import { toSize } from '../helpers/scaling';
import i18n from './i18n';
const { StatusBarManager } = NativeModules;

export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : Platform.OS === 'web' ? 20 : StatusBarManager.HEIGHT;
export const BOTTOM_NAV_HEIGHT = toSize(50);
export const margins = {
  window_hor: toSize(12),
  window_vert: toSize(STATUSBAR_HEIGHT),
  window_hor_w_icon: toSize(10),
};

export const iconSize = {
  sm: 25,
  md: 30,
  lg: 50,
};

export const SITE_URL = 'https://docs.google.com/document/d/10NVEhKlNySMA-iQWAsp3REKYFR47hObkRPAkagXYyHc/edit?usp=sharing';
export type Language = 'English' | 'Bangla';

export { i18n };
