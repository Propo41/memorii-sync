import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text, Button } from '@rneui/themed';
import { NavProps } from '../config/routes';

export default function HomeScreen({ navigation }: NavProps) {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text h3>Sets</Text>
      <Button onPress={() => navigation.push('Sets')} title={'Go to sets'} />
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
  },
}));
