import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { HomeScreen, StoreScreen, MyDecksScreen, SettingsScreen } from '../views';
import { BottomNavRoutes, BottomParamList } from '../config/routes';
import { makeStyles, useTheme } from '@rneui/themed';
import { margins } from '../config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { toSize } from '../helpers/scaling';

const RootTab = createBottomTabNavigator<BottomParamList>();

export default function BottomNavigator() {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <RootTab.Navigator
      sceneContainerStyle={styles.scene}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.purple,
        tabBarInactiveTintColor: theme.colors.ash,
      }}
      initialRouteName={BottomNavRoutes.Settings}
    >
      <RootTab.Screen
        name={BottomNavRoutes.Home}
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home-filled" color={color} size={size} />,
        }}
      />
      <RootTab.Screen
        name={BottomNavRoutes.Store}
        component={StoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="store" color={color} size={size} />,
        }}
      />
      <RootTab.Screen
        name={BottomNavRoutes.MyDecks}
        component={MyDecksScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="add-box" color={color} size={size} />,
        }}
      />
      <RootTab.Screen
        name={BottomNavRoutes.Settings}
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="settings" color={color} size={size} />,
        }}
      />
    </RootTab.Navigator>
  );
}

const useStyles = makeStyles((theme) => ({
  content: { paddingHorizontal: margins.window_hor, backgroundColor: theme.colors.background },
  tabBar: {
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.8,
    shadowRadius: 16.0,
    elevation: 24,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    borderTopWidth: 0,
    borderWidth: 0,
    backgroundColor: theme.mode === 'dark' ? theme.colors.violetShade : theme.colors.background,
    position: 'absolute',
    bottom: 0,
    zIndex: 0,
    height: toSize(55),
  },
  scene: {
    backgroundColor: theme.colors.background,
  },
}));
