import React from 'react';
import { View } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';

export default function Card({ text, style }) {
  const styles = useStyles();

  return (
    <View style={{ ...styles.container, ...style }}>
      <Text>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    backgroundColor: '#FF8787',
    height: '60%',
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
}));
