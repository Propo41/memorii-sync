import React from 'react';
import { Image, Animated, StyleProp, ViewStyle, GestureResponderHandlers } from 'react-native';
import { makeStyles } from '@rneui/themed';

type CardProps = {
  item: { uri: string; id: string };
  containerStyle: StyleProp<ViewStyle>;
  dragHandlers?: GestureResponderHandlers;
};

export default function Card({ item, containerStyle, dragHandlers = {} }: CardProps) {
  const styles = useStyles();

  return (
    <Animated.View {...dragHandlers} style={containerStyle}>
      <Image style={styles.card} source={item.uri} />
    </Animated.View>
  );
}

const useStyles = makeStyles(() => ({
  card: { flex: 1, height: '100%', width: '100%', resizeMode: 'cover', borderRadius: 20 },
}));
