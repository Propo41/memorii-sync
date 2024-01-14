import { Colors } from '@rneui/base';
import { RecursivePartial } from '@rneui/themed/dist/config/theme';

type ColorPalette = {
  light: RecursivePartial<Colors>;
  dark: RecursivePartial<Colors>;
};

const palette: ColorPalette = {
  light: {
    background: '#FFFFFF',
    orange: '#FF7C7C',
    white: '#FFFFFF',
    purple: '#7C82FF',
    ash: '#D4D4D4',
    lightAsh: '#EEEEEE',
    black: '#555555',
    primary: '#7C82FF',
    secondary: '#555555',
    violetShade: '#3C1E64',
    text: '#555555',
    grey: 'grey',
    touchable: '#D4D4D4',
    green: '#75F94C',
    darkRed: '#8B1A10',
    transparent: 'transparent',
  },
  dark: {
    background: '#371D58',
    orange: '#FF7C7C',
    white: '#FFFFFF',
    purple: '#7C82FF',
    ash: '#D4D4D4',
    lightAsh: '#EEEEEE',
    black: '#555555',
    primary: '#7C82FF',
    secondary: '#555555',
    violetShade: '#3C1E64',
    text: '#FFFFFF',
    grey: 'grey',
    touchable: '#512C81',
    green: '#75F94C',
    darkRed: '#8B1A10',
    transparent: 'transparent',
  },
};

export default palette;
