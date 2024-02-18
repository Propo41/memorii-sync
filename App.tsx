import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AppNavigator } from './src/navigation';
import { palette, typography } from './src/theme';
import { NavRoutes } from './src/config/routes';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { FIREBASE_WEB_CLIENT_ID, REVENUECAT_GOOGLE_API_KEY, REVENUECAT_USER_ID } from './src/config/conf';
import CustomToast from './src/components/CustomToast';
import Purchases from 'react-native-purchases';
import { log } from './src/helpers/utility';

const theme = createTheme({
  lightColors: palette['light'],
  darkColors: palette['dark'],
  components: {
    Text: typography,
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_700Bold,
  });
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: FIREBASE_WEB_CLIENT_ID,
    });

    const setup = async () => {
      if (Platform.OS == 'android') {
        await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY, appUserID: REVENUECAT_USER_ID });
      }
    };

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    setup().catch((e) => {
      log('Error', e);
    });
  }, []);

  useEffect(() => {
    const setup = async () => {
      if (Platform.OS == 'android') {
        await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_API_KEY, appUserID: REVENUECAT_USER_ID });
      }
    };

    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

    setup().catch((e) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    const _user = auth().currentUser;
    setUser(_user);
    setInitializing(false);
  }, []);

  if (!fontsLoaded && initializing) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator initialRoute={!user ? NavRoutes.Login : NavRoutes.App} />
          <CustomToast position="bottom" />
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const BACKGROUND_COLOR = '#F8F9FF';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});
