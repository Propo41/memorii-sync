import React, { useCallback, useRef, useState } from 'react';
import { NavProps } from '../config/routes';
import NavigationBar from '../components/NavigationBar';
import { View, Dimensions, Image, Animated, PanResponder } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const users = [
  { id: '1', uri: require('../assets/1.jpg') },
  { id: '2', uri: require('../assets/2.jpg') },
  { id: '3', uri: require('../assets/3.jpg') },
  { id: '4', uri: require('../assets/4.jpg') },
  { id: '5', uri: require('../assets/5.jpg') },
];

export default function CardsScreen({ navigation }: NavProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1);
            position.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1);
            position.setValue({ x: 0, y: 0 });
          });
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

  const renderUsers = useCallback(() => {
    return users
      .map((item, i) => {
        if (i < currentIndex) {
          return null;
        } else if (i === currentIndex) {
          return (
            <Animated.View
              key={item.id}
              {...panResponder.panHandlers}
              style={[rotateAndTranslate, { height: SCREEN_HEIGHT - 120, width: SCREEN_WIDTH, padding: 10, position: 'absolute' }]}
            >
              <Image style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }} source={item.uri} />
            </Animated.View>
          );
        } else {
          return (
            <Animated.View
              key={item.id}
              style={[
                {
                  opacity: nextCardOpacity,
                  transform: [{ scale: nextCardScale }],
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: 'absolute',
                },
              ]}
            >
              <Image style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }} source={item.uri} />
            </Animated.View>
          );
        }
      })
      .reverse();
  }, [currentIndex]);

  return (
    <View style={{ flex: 1 }}>
      <NavigationBar title="" />
      <View style={{ flex: 1 }}>{renderUsers()}</View>
    </View>
  );
}
