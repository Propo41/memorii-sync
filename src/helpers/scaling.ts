import { Dimensions, Platform, PixelRatio, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const baseLineHeight = 800;
const baseLineWidth = 360;
const scale = SCREEN_WIDTH / baseLineWidth;
const scaleVertical = SCREEN_HEIGHT / baseLineHeight;

export function toSize(size: number, type: string = 'hor') {
  const newSize = type === 'hor' ? size * scale : size * scaleVertical;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
  }
}

export function toFont(fontSize: number) {
  const { height, width } = Dimensions.get('window');
  console.log(height, width);

  const standardLength = width > height ? width : height;
  const offset = width > height ? 0 : StatusBar.currentHeight || 0;

  const deviceHeight = Platform.OS === 'android' ? standardLength - offset : standardLength;

  const heightPercent = (fontSize * deviceHeight) / baseLineHeight;
  console.log(heightPercent);

  return Math.round(heightPercent);
}
