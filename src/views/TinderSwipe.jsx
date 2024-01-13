import { View, Animated, PanResponder, Image, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
const { height, width } = Dimensions.get('window');

const TinderCard = ({ item, isFirst, swipe, ...rest }) => {
  const rotate = swipe.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: ['8deg', '0deg', '-8deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: width - 20,
          height: height - 200,
          position: 'absolute',
          top: 50,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        },
        isFirst && {
          transform: [...swipe.getTranslateTransform(), { rotate: rotate }],
        },
      ]}
      {...rest}
    >
      <Image source={item.uri} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
    </Animated.View>
  );
};

const TinderSwipeDemo = () => {
  const [data, setData] = useState([
    { id: '1', uri: require('../assets/1.jpg') },
    { id: '2', uri: require('../assets/2.jpg') },
    { id: '3', uri: require('../assets/3.jpg') },
    { id: '4', uri: require('../assets/4.jpg') },
    { id: '5', uri: require('../assets/5.jpg') },
  ]);

  useEffect(() => {
    if (!data.length) {
      setData([
        { id: '1', uri: require('../assets/1.jpg') },
        { id: '2', uri: require('../assets/2.jpg') },
        { id: '3', uri: require('../assets/3.jpg') },
        { id: '4', uri: require('../assets/4.jpg') },
        { id: '5', uri: require('../assets/5.jpg') },
      ]);
    }
  }, [data]);

  const swipe = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const panResponser = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx, dy }) => {
      console.log('dx:' + dx + ' dy:' + dy);
      swipe.setValue({ x: dx, y: dy });
    },

    onPanResponderRelease: (_, { dx, dy }) => {
      console.log('released:' + 'dx:' + dx + ' dy:' + dy);
      let direction = Math.sign(dx);
      let isActionActive = Math.abs(dx) > 200;
      if (isActionActive) {
        Animated.timing(swipe, {
          toValue: { x: 500 * dx, y: dy },
          useNativeDriver: true,
          duration: 500,
        }).start(removeCard);
      } else {
        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
        }).start();
      }
    },
  });

  const removeCard = useCallback(() => {
    setData((prepState) => prepState.slice(1));
    swipe.setValue({ x: 0, y: 0 });
  }, [swipe]);

  return (
    <View style={{ flex: 1 }}>
      {data
        .map((item, index) => {
          let isFirst = index === 0;
          let dragHanlders = isFirst ? panResponser.panHandlers : {};
          return <TinderCard item={item} rotate={rotate} isFirst={isFirst} swipe={swipe} {...dragHanlders} />;
        })
        .reverse()}
    </View>
  );
};

export default TinderSwipeDemo;
