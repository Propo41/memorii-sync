import { TextProps } from '@rneui/themed';
import { TextStyle } from 'react-native';
import { toFont } from '../helpers/scaling';

// ----------------------------------------------------------------------

const FF_REGULAR = 'JosefinSans_400Regular';
const FF_BOLD = 'JosefinSans_700Bold';

type FontStyle = {
  head1?: TextStyle;
  head2?: TextStyle;
  head3?: TextStyle;
  body1?: TextStyle;
  body1_bold?: TextStyle;
  body2?: TextStyle;
  body2_bold?: TextStyle;
};

const fontStyle: FontStyle = {
  head1: {
    fontSize: toFont(43),
    fontFamily: FF_BOLD,
  },
  head2: {
    fontSize: toFont(35),
    fontFamily: FF_BOLD,
  },
  head3: {
    fontSize: toFont(25),
    fontFamily: FF_BOLD,
  },
  body1: {
    fontSize: toFont(20),
    fontFamily: FF_REGULAR,
    lineHeight: 25,
  },
  body1_bold: {
    fontSize: toFont(20),
    fontFamily: FF_BOLD,
  },
  body2: {
    fontSize: toFont(12),
    fontFamily: FF_REGULAR,
  },
  body2_bold: {
    fontSize: toFont(12),
    fontFamily: FF_BOLD,
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
