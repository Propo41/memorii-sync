import React, { useRef } from 'react';
import { Animated, View, StyleSheet, PanResponder, Text } from 'react-native';

const TestScreen = () => {
  const pan = useRef(new Animated.ValueXY()).current;

  const backgroundColor = pan.x.interpolate({
    inputRange: [-500, 0, 500],
    outputRange: ['rgba(255, 255, 0, 1)', 'rgba(255, 255, 255, 1)', 'rgba(128, 0, 128, 1)'],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx, dy }) => {
        pan.setValue({ x: dx, y: dy });
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View style={{ backgroundColor: backgroundColor }}>
        <Text style={styles.titleText}>Drag & Release this box!</Text>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.box} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
});

export default TestScreen;
