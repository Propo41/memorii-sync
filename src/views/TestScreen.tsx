import { Text } from '@rneui/themed';
import React from 'react';
import { useRef } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';

const TestScreen = () => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;

  flipAnimation.addListener(({ value }) => {
    flipRotation = value
    console.log(value);
    
  });

  const flipToFrontStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };
  const flipToBackStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPress={() => (flipRotation ? flipToBack() : flipToFront())}>
      <Animated.View style={{ ...Styles.front, ...flipToBackStyle }}>
        <Text>Front View</Text>
      </Animated.View>
      <Animated.View style={{ ...Styles.back, ...flipToFrontStyle }}>
        <Text>Back</Text>
      </Animated.View>
    </Pressable>
  );
};

export default TestScreen;

const Styles = StyleSheet.create({
  front: {
    height: 400,
    width: 250,
    backgroundColor: '#D8D9CF',
    borderRadius: 16,
    position: 'absolute',
    
  },
  back: {
    height: 400,
    width: 250,
    backgroundColor: '#FF8787',
    borderRadius: 16,
    backfaceVisibility: 'hidden',
    zIndex: 10,
  },
});
