import { SetsScreen } from '../views';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from './BottomNavigator';
import { NavParamList, NavRoutes } from '../config/routes';
import { makeStyles } from '@rneui/themed';
import React from 'react';

const RootStack = createNativeStackNavigator<NavParamList>();

export default function AppNavigator() {
  const styles = useStyles();
  return (
    <RootStack.Navigator initialRouteName={NavRoutes.App} screenOptions={{ headerShown: false }}>
      <RootStack.Screen name={NavRoutes.App} component={BottomNavigator} />
      <RootStack.Screen name={NavRoutes.Sets} component={SetsScreen} options={styles} />
    </RootStack.Navigator>
  );
}

const useStyles = makeStyles((theme) => ({
  contentStyle: { backgroundColor: theme.colors.background },
}));
