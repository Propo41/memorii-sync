import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text, Button, useThemeMode, useTheme } from '@rneui/themed';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function MyDecks() {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();

  return (
    <View>
      <Text>MyDecks</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginVertical: theme.spacing.lg,
  },
}));
