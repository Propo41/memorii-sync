import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export enum NavRoutes {
  App = 'App', // contains the bottom nav bar
  Sets = 'Sets',
  Cards = 'Cards',
  Test = 'Test',
  Login = 'Login',
  Store = 'Store',
  CreateDeck = 'CreateDeck',
}

export enum BottomNavRoutes {
  Home = 'Home',
  Stores = 'Stores',
  MyDecks = 'MyDecks',
  Settings = 'Settings',
}

const NavProps: Record<string, undefined> = Object.keys(NavRoutes).reduce((obj, key) => ({ ...obj, [key]: undefined }), {});

export type NavScreenProps<RouteName extends keyof NavParamList> = NativeStackScreenProps<NavParamList, RouteName>;

const BottomTabProps: Record<string, undefined> = Object.keys(BottomNavRoutes).reduce((obj, key) => ({ ...obj, [key]: undefined }), {});

export type NavParamList = typeof NavProps;
export type BottomParamList = typeof BottomTabProps;
export type NavProps = NativeStackScreenProps<NavParamList>;
export type BottomTabProps = BottomTabNavigationProp<BottomParamList>;
