import { TextProps } from "@rneui/themed";
import { TextStyle, Dimensions, PixelRatio } from "react-native";
// ----------------------------------------------------------------------

// Function to convert pixels to dp (density-independent pixels)
const pxToDp = (px: number) => {
  const scaleFactor = PixelRatio.get();
  return px / scaleFactor;
};

const responsiveFontSize = (fontSize: number) => {
  const fontScale = PixelRatio.getFontScale();
  const scaledFontSize = fontSize / fontScale;

  return scaledFontSize;
};

const FONT_PRIMARY = "Public Sans, sans-serif";

type FontStyle = {
  h1?: TextStyle;
  h2?: TextStyle;
  h3?: TextStyle;
  h4?: TextStyle;
  h5?: TextStyle;
  body1?: TextStyle;
  body2?: TextStyle;
};

const fontStyle: FontStyle = {
  h1: {
    fontSize: responsiveFontSize(80),
    fontFamily: FONT_PRIMARY,
  },
  h2: {
    fontSize: responsiveFontSize(50),
    fontFamily: FONT_PRIMARY,
  },
  h3: {
    fontSize: responsiveFontSize(30),
    fontFamily: FONT_PRIMARY,
  },
  body1: {
    fontSize: responsiveFontSize(100),
    fontFamily: FONT_PRIMARY,
  },
  body2: {
    fontSize: responsiveFontSize(16),
    fontFamily: FONT_PRIMARY,
  },
};

const typography = (props: TextProps) => {
  const propKey = Object.keys(props).find(
    (key) => fontStyle[key as keyof FontStyle]
  );

  const typography: TextProps = {
    style: propKey ? fontStyle[propKey as keyof FontStyle] : fontStyle["body1"],
  };

  return typography;
};

export default typography;
