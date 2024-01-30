import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { dummyDecks, dummyUser } from './src/database';
import { Cache } from './src/models/Cache';
import { FirebaseApp } from './src/models/FirebaseApp';

import { AppNavigator } from './src/navigation';
import { palette, typography } from './src/theme';

const userId = 'SDBk0R01TxrTHF839qoL';

const createDummyData = async () => {
  // create dummy decks
  const deckIds = [];
  for (const deck of dummyDecks) {
    const deckId = await FirebaseApp.getInstance().createDeck(deck);
    deckIds.push(deckId);
  }

  // create dummy user
  // @ts-expect-error bla ba
  dummyUser.decksPurchased.push(...deckIds);
  const userId = await FirebaseApp.getInstance().createUser(dummyUser);
  console.log('dummy user id: ', userId);

  Cache.getInstance().saveUser(userId, dummyUser)
};

const createCompleted = async () => {
  const status = new Map<string, boolean>([
    ['0', true],
    ['1', true],
    ['2', false],
  ]);
  await FirebaseApp.getInstance().updateCardStatuses(userId, 'MPtAu9SrzAKIu3WZ3qzO', '1', status);
};

const getUser = async (userId: string) => {
  const user = await FirebaseApp.getInstance().getUser(userId);
  return user;
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

  React.useEffect(() => {
  //  createDummyData();

    // check if user is authenticated and store the userid in asyncstorage
    getUser(userId).then((user) => {
      if (user) {
        Cache.getInstance().saveUser(userId, user);
      }
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
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
