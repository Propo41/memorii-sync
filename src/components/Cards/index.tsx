import React, { useCallback, useRef, useState } from 'react';
import { View, Animated, PanResponder } from 'react-native';
import { makeStyles } from '@rneui/themed';
import { SCREEN_HEIGHT } from '../../helpers/scaling';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Card from './Card';

type SwipeableCardsProps = {
  cards: {
    id: string;
    uri: string;
  }[];
};

export default function SwipeableCards({ cards }: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const styles = useStyles();
  
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [{ rotate }, ...position.getTranslateTransform()],
  };

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp',
  });

  const removeCard = useCallback(() => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
    position.setValue({ x: 0, y: 0 });
  }, [position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx, dy }) => {
        position.setValue({ x: dx, y: dy });
      },
      onPanResponderRelease: (_, { dx, dy }) => {
        const isOutOfRange = Math.abs(dx) > 120;
        const direction = Math.sign(dx);
        if (isOutOfRange) {
          Animated.timing(position, {
            toValue: { x: direction * (SCREEN_WIDTH + 100), y: dy },
            useNativeDriver: true,
            duration: 200,
          }).start(removeCard);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 4,
          }).start();
        }
      },
    })
  ).current;

  const renderCards = useCallback(() => {
    return cards
      .map((item, i) => {
        if (i < currentIndex) {
          return null;
        } else {
          const style =
            i === currentIndex
              ? { ...rotateAndTranslate, ...styles.cardContainerTop }
              : { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.cardContainerBack };
          const dragHandlers = i === currentIndex ? panResponder.panHandlers : {};
          // @ts-expect-error type mismatch todo fix later
          return <Card key={item.id} item={item} dragHandlers={dragHandlers} containerStyle={style} />;
        }
      })
      .reverse();
  }, [currentIndex]);

  return <View>{renderCards()}</View>;
}

const useStyles = makeStyles(() => ({
  card: { flex: 1, height: '100%', width: '100%', resizeMode: 'cover', borderRadius: 20 },
  cardContainerTop: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: 'absolute',
  },
  cardContainerBack: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: 'absolute',
  },
}));
