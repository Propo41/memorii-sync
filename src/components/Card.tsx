import React from 'react';
import { View, ViewStyle } from 'react-native';
import { makeStyles, Text } from '@rneui/themed';
import { toFont } from '../helpers/scaling';
import { FF_BOLD, FF_REGULAR } from '../theme/typography';

type CardProps = {
  text: string;
  style?: ViewStyle;
  isTopView?: boolean;
};

export default function Card({ text, style, isTopView = true }: CardProps) {
  const styles = useStyles();

  return (
    <View style={{ ...styles.container, ...style }}>
      <Text style={isTopView ? styles.topViewText : styles.backViewText}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    alignItems: 'center',
  },
  topViewText: {
    fontSize: toFont(25),
    fontFamily: FF_BOLD,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  backViewText: {
    fontSize: toFont(22),
    fontFamily: FF_REGULAR,
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
}));
