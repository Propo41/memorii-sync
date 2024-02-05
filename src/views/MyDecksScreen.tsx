import React from 'react';
import { Image, View } from 'react-native';
import { makeStyles } from '@rneui/themed';
import { NavProps } from '../config/routes';
import TitleBar from '../components/TitleBar';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MyDecks({ navigation }: NavProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <TitleBar title="My Decks" subtitle="Your available decks" />
      <Image style={styles.image} source={require('../assets/under_work.png')} />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    textAlign: 'center',
    alignItems: 'center',
  },
  image: {
    marginTop: 30,
  },
}));
