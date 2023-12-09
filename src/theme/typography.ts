import { TextProps } from '@rneui/themed';
import { TextStyle } from 'react-native';
import { toFont } from '../helpers/scaling';

// ----------------------------------------------------------------------

const FF_REGULAR = 'JosefinSans_400Regular';
const FF_BOLD = 'JosefinSans_400Regular';

type FontStyle = {
  h1?: TextStyle;
  h2?: TextStyle;
  h3?: TextStyle;
  body1?: TextStyle;
  body2?: TextStyle;
};

const fontStyle: FontStyle = {
  h1: {
    fontSize: toFont(43),
    fontFamily: FF_BOLD,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: toFont(35),
    fontFamily: FF_BOLD,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: toFont(25),
    fontFamily: FF_BOLD,
    fontWeight: 'bold',
  },
  body1: {
    fontSize: toFont(20),
    fontFamily: FF_REGULAR,
    lineHeight: 25,
  },
  body2: {
    fontSize: toFont(12),
    fontFamily: FF_REGULAR,
  },
};

const typography = (props: TextProps) => {
  const propKey = Object.keys(props).find((key) => fontStyle[key as keyof FontStyle]);
  const typography: TextProps = {
    style: propKey ? fontStyle[propKey as keyof FontStyle] : fontStyle['body1'],
  };

  return typography;
};

export default typography;
