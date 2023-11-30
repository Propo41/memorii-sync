import { SetsScreen } from '../views';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavigator from './BottomNavigator';
import { NavParamList, NavRoutes } from '../config/routes';

const RootStack = createNativeStackNavigator<NavParamList>();

export default function AppNavigator() {
  return (
    <RootStack.Navigator initialRouteName={NavRoutes.App} screenOptions={{ headerShown: false }}>
      <RootStack.Screen name={NavRoutes.App} component={BottomNavigator} />
      <RootStack.Screen name={NavRoutes.Sets} component={SetsScreen} />
    </RootStack.Navigator>
  );
}
