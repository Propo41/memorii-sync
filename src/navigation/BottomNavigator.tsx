import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, StoreScreen, MyDecksScreen, SettingsScreen } from '../views';
import { BottomNavRoutes, BottomParamList } from '../config/routes';

const RootTab = createBottomTabNavigator<BottomParamList>();

export default function BottomNavigator() {
  return (
    <RootTab.Navigator screenOptions={{ headerShown: false }}>
      <RootTab.Screen name={BottomNavRoutes.Home} component={HomeScreen} />
      <RootTab.Screen name={BottomNavRoutes.Store} component={StoreScreen} />
      <RootTab.Screen name={BottomNavRoutes.MyDecks} component={MyDecksScreen} />
      <RootTab.Screen name={BottomNavRoutes.Settings} component={SettingsScreen} />
    </RootTab.Navigator>
  );
}
