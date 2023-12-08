import React from 'react';
import { createTheme, ThemeProvider } from '@rneui/themed';
import { palette, typography } from './src/theme';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation';

const theme = createTheme({
  lightColors: palette['light'],
  darkColors: palette['dark'],
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
