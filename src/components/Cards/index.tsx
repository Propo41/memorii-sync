import React, { useCallback, useRef, useState } from 'react';
import { View, Animated, PanResponder, Image } from 'react-native';
import { Button, makeStyles } from '@rneui/themed';
import { SCREEN_HEIGHT } from '../../helpers/scaling';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import Card from './Card';

type SwipeableCardsProps = {
  cards: {
    id: string;
    key: string;
    value: string;
  }[];
};

export default function SwipeableCards({ cards }: SwipeableCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const styles = useStyles();
  const [isFlipped, setIsFlipped] = useState(false);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => {
    flipRotation = value;
    console.log(value);
  });

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // setIsFlipped((p) => !p);
    });
  };

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // setIsFlipped(true);
    });
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [
      { rotate },
      ...position.getTranslateTransform(),
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const rotateAndTranslate2 = {
    transform: [
      { rotate },
      ...position.getTranslateTransform(),
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
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
    setIsFlipped(false);
    flipAnimation.setValue(0);
    flipRotation = 0;
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
        } else if (i === currentIndex) {
          return (
            <View key={item.id}>
              {isFlipped ? (
                <Animated.View {...panResponder.panHandlers} style={{ ...rotateAndTranslate2, ...styles.currentCardContainer }}>
                  <Card text={item.value} style={styles.front} />
                </Animated.View>
              ) : (
                <Animated.View {...panResponder.panHandlers} style={{ ...rotateAndTranslate, ...styles.currentCardContainer }}>
                  <Card text={item.key} style={styles.back} />
                </Animated.View>
              )}
            </View>
          );
        } else {
          return (
            <Animated.View key={item.id} style={{ opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.incomingCardContainer }}>
              <Card />
            </Animated.View>
          );
        }
      })
      .reverse();
  }, [currentIndex, isFlipped]);

  return (
    <View>
      {renderCards()}
      <Button
        title="Reveal"
        onPress={() => {
          flipRotation ? flipToBack() : flipToFront();
          setIsFlipped((p) => !p);
        }}
      />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  card: { flex: 1, height: '100%', width: '100%', resizeMode: 'cover', borderRadius: 20 },
  currentCardContainer: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: 'absolute',
    alignItems: 'center',
    marginTop: 30,
  },
  incomingCardContainer: {
    height: SCREEN_HEIGHT - 120,
    width: SCREEN_WIDTH,
    padding: 10,
    position: 'absolute',
    alignItems: 'center',
    marginTop: 30,
  },
  front: {
    backgroundColor: '#D8D9CF',
  },
  back: {
    backgroundColor: '#FF8787',
    backfaceVisibility: 'hidden',
    zIndex: 10,
  },
}));
