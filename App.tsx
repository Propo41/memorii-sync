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
import { firebaseWebClientId } from './src/config/conf';
import CustomToast from './src/components/CustomToast';
import Purchases, { LOG_LEVEL, PurchasesOffering } from 'react-native-purchases';

const APIKeys = {
  google: 'goog_UOztdiTAHtBuVBuwisNOgzvJFdT',
};

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
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: firebaseWebClientId,
    });
  }, []);

  useEffect(() => {
    const setup = async () => {
      // if (Platform.OS == 'android') {
      //   await Purchases.configure({ apiKey: APIKeys.google, appUserID: 'app1486623cbe' });
      // }

      // // const offerings = await Purchases.getProducts(['brainflip.access'], 'NON_SUBSCRIPTION');
      // // console.log('offerings', offerings);

      // // await Purchases.purchaseStoreProduct(offerings[0]);

      // if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      //   // Display packages for sale
      // }
      // console.log(offerings);

      // setCurrentOffering(offerings.current);
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

  if (!fontsLoaded && initializing && !currentOffering) {
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
