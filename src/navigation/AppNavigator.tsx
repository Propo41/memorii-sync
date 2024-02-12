import { CardsScreen, LoginScreen, SetsScreen, StoreScreen } from '../views';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from './BottomNavigator';
import { NavParamList, NavRoutes } from '../config/routes';
import { makeStyles } from '@rneui/themed';
import React from 'react';
import CreateDeckScreen from '../views/CreateDeckScreen';

const RootStack = createNativeStackNavigator<NavParamList>();

type AppNavigatorProps = {
  initialRoute: string;
};

export default function AppNavigator({ initialRoute }: AppNavigatorProps) {
  const styles = useStyles();
  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ animationDuration: 10, headerShown: false, presentation: 'transparentModal', animation: 'slide_from_right' }}
    >
      <RootStack.Screen name={NavRoutes.App} component={BottomNavigator} />
      <RootStack.Screen name={NavRoutes.Sets} component={SetsScreen} options={styles} />
      <RootStack.Screen name={NavRoutes.Cards} component={CardsScreen} options={styles} />
      <RootStack.Screen name={NavRoutes.Login} component={LoginScreen} options={styles} />
      <RootStack.Screen name={NavRoutes.Store} component={StoreScreen} options={styles} />
      <RootStack.Screen name={NavRoutes.CreateDeck} component={CreateDeckScreen} options={styles} />
    </RootStack.Navigator>
  );
}

const useStyles = makeStyles((theme) => ({
  contentStyle: { backgroundColor: theme.colors.background },
}));
