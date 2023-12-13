import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { NavProps } from '../config/routes';
import TitleBar from '../components/TitleBar';

export default function MyDecks({ navigation }: NavProps) {
  const styles = useStyles();

  return (
    <View>
      <TitleBar title="My Decks" subtitle="Your available decks" />
      <Text>hello</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({}));
