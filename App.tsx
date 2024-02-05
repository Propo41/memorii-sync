import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { dummyDecks, dummyUser } from './src/database';
// import { FirebaseApp } from './src/models/FirebaseApp';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { AppNavigator } from './src/navigation';
import { palette, typography } from './src/theme';
import { NavRoutes } from './src/config/routes';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { firebaseWebClientId } from './src/config/conf';
import CustomToast from './src/components/CustomToast';

// const createDummyData = async () => {
//   // create dummy decks
//   const deckIds = [];
//   for (const deck of dummyDecks) {
//     const deckId = await FirebaseApp.getInstance().createDeck(deck);
//     deckIds.push(deckId);
//   }

//   // create dummy user
//   // @ts-expect-error bla ba
//   dummyUser.decksPurchased.push(...deckIds);
//   const userId = await FirebaseApp.getInstance().createUser(dummyUser);

//   Cache.getInstance().saveUser(userId, dummyUser);
// };

// const createCompleted = async () => {
//   const status = new Map<string, boolean>([
//     ['0', true],
//     ['1', true],
//     ['2', false],
//   ]);
//   await FirebaseApp.getInstance().updateCardStatuses(userId, 'MPtAu9SrzAKIu3WZ3qzO', '1', status);
// };

// const getUser = async (userId: string) => {
//   const user = await FirebaseApp.getInstance().getUser(userId);
//   return user;
// };

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
      webClientId: firebaseWebClientId,
    });
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user: FirebaseAuthTypes.User | null) => {
      if (user) {
        // signed in
        setUser(user);
      } else {
        // signed out
        setUser(null);
      }
      if (initializing) {
        setInitializing(false);
      }
    });

    return subscriber; // unsubscribe on unmount
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
