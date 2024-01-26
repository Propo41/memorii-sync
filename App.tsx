import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts } from '@expo-google-fonts/josefin-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createTheme, ThemeProvider } from '@rneui/themed';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';

import { AppNavigator } from './src/navigation';
import { palette, typography } from './src/theme';

// const createDummyData = async () => {
//   const user = new User('ahnaf1233', 'ahnaf@gmail.com', 'https://api.dicebear.com/7.x/pixel-art/svg');

//   const preference = new UserPreference();
//   preference.isDarkMode = true;
//   user.preferences = preference;

//   const cards = [
//     new Card('1', 'dog', 'this is a dog'),
//     new Card('2', 'dog', 'this is a dog'),
//     new Card('2', 'dog', 'this is a dog'),
//     new Card('2', 'dog', 'this is a dog'),
//   ];

//   const deck = new Deck('English');
//   const set1 = new Set('Beginner')
//   set1.cards = cards;

//   const set2 = new Set('Intermediate')
//   set2.cards = cards;

//   deck.sets = [set1, set2]

//   try {
//     await firestore().collection('users').doc('L6aY5b9imyIuYE72Sumb').update(user);
//     await firestore().collection('decks').doc('1jX55p9H0BFsTSXWbRJR').update(deck);
//   } catch (error) {
//     console.log(error);
//   }
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

  firestore().settings({
    ignoreUndefinedProperties: true,
  });

  // check if user is authenticated and store the userid in asyncstorage
 // createDummyData();

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
