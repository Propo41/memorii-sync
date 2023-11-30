import { Colors } from "@rneui/base";
import { RecursivePartial } from "@rneui/themed/dist/config/theme";

type ColorPalette = {
  light: RecursivePartial<Colors>;
  dark: RecursivePartial<Colors>;
};

const palette: ColorPalette = {
  light: {
    background: "#FFFFFF",
    orange: "#FF7C7C",
    white: "#FFFFFF",
    purple: "#7C82FF",
    ash: "#D4D4D4",
    lightAsh: "#EEEEEE",
    black: "#555555",
  },
  dark: {
    background: "#371D58",
    orange: "#FF7C7C",
    white: "#FFFFFF",
    purple: "#7C82FF",
    ash: "#D4D4D4",
    lightAsh: "#EEEEEE",
    black: "#555555",
  },
};

export default palette;
