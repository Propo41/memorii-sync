import React from "react";
import { createTheme, TextProps, ThemeProvider } from "@rneui/themed";
import { palette, typography } from "./src/theme";
import { TextProps as TextProperties, TextStyle } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Routes } from "./src/config/routes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AppNavigator } from "./src/navigation";

const theme = createTheme({
  lightColors: palette["light"],
  darkColors: palette["dark"],
  components: {
    Text: typography,
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
