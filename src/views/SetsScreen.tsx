import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text, Button, useThemeMode, useTheme } from '@rneui/themed';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';

const Tab = createBottomTabNavigator();

export default function SetsScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { setMode, mode } = useThemeMode();
  const { theme } = useTheme();
  console.log(mode);

  //navigation.navigate()

  return (
    <View>
      <NavigationBar title="Sets" />
      <Text head1>Sets</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
