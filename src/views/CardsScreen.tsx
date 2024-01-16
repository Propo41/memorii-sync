import NavigationBar from '../components/NavigationBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import React, { View, Animated, PanResponder } from 'react-native';
import { FAB, LinearProgress, makeStyles, Text, useTheme } from '@rneui/themed';
import { SCREEN_WIDTH, toSize } from '../helpers/scaling';
import Card from '../components/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { iconSize } from '../config';

const cards = [
  { id: '1', key: 'dog', value: 'an brown a fascinating creature from the imaginary world', completed: false },
  { id: '2', key: 'monkey', value: 'an gray a mysterious being with magical powers', completed: false },
  { id: '3', key: 'elephant', value: 'an spotted a mysterious being with magical powers', completed: false },
  { id: '4', key: 'lion', value: 'an brown a mysterious being with magical powers', completed: false },
  { id: '5', key: 'cat', value: 'an spotted a fascinating creature from the imaginary world', completed: false },
  { id: '6', key: 'dog', value: 'an brown a fascinating creature from the imaginary world', completed: false },
  { id: '7', key: 'monkey', value: 'an gray a mysterious being with magical powers', completed: false },
  { id: '8', key: 'elephant', value: 'an spotted a mysterious being with magical powers', completed: false },
  { id: '9', key: 'lion', value: 'an brown a mysterious being with magical powers', completed: false },
  { id: '10', key: 'cat', value: 'an spotted a fascinating creature from the imaginary world', completed: false },
  { id: '11', key: 'dog', value: 'an brown a fascinating creature from the imaginary world', completed: false },
  { id: '12', key: 'monkey', value: 'an gray a mysterious being with magical powers', completed: false },
  { id: '13', key: 'elephant', value: 'an spotted a mysterious being with magical powers', completed: false },
  { id: '14', key: 'lion', value: 'an brown a mysterious being with magical powers', completed: false },
  { id: '15', key: 'cat', value: 'an spotted a fascinating creature from the imaginary world', completed: false },
];

type ControlsProps = {
  onPressCross: () => void;
  onPressRotate: () => void;
  onPressCheck: () => void;
};

const Controls = ({ onPressCross, onPressRotate, onPressCheck }: ControlsProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.controls}>
      <FAB size="large" color="white" icon={<EntypoIcons name="cross" color="#FF3636" size={iconSize.sm} />} onPress={onPressCross} />
      <FAB
        style={{ marginLeft: theme.spacing.lg }}
        size="large"
        icon={{
          name: 'rotate-90-degrees-ccw',
          color: 'white',
        }}
        onPress={onPressRotate}
      />
      <FAB
        size="large"
        style={{ marginLeft: theme.spacing.lg }}
        icon={<MaterialCommunityIcons name="check-bold" color="#4FF960" size={iconSize.sm} />}
        color="white"
        onPress={onPressCheck}
      />
    </View>
  );
};

const CardsScreen = () => {
  const [currentCard, setCurrentCard] = useState({ index: 0, isCorrect: false });
  const [progress, setProgress] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const styles = useStyles();
  const { theme } = useTheme();
  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => (flipRotation = value));

  useEffect(() => {
    if (currentCard.index === 0) return;
    console.log('card swiped: ', currentCard.index);

    setProgress(currentCard.index / cards.length);
    cards[currentCard.index - 1].completed = currentCard.isCorrect;
  }, [currentCard]);

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 180,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [{ rotate }, ...position.getTranslateTransform()],
  };

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

  const correctGuessOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const backgroundColor = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['rgba(255, 132, 132, 1)', theme.colors.cardsBackground!, 'rgba(132, 255, 144, 1)'],
    extrapolate: 'clamp',
  });

  const wrongGuessOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  const removeCard = (isCorrect: boolean) => {
    setCurrentCard((prevCard) => ({ index: prevCard.index + 1, isCorrect }));
    position.setValue({ x: 0, y: 0 });
    flipAnimation.setValue(0);
    flipRotation = 0;
  };

  const onWrongGuess = (dy = 0, duration = 400) => {
    Animated.timing(position, {
      toValue: { x: -1 * (SCREEN_WIDTH + 100), y: dy },
      useNativeDriver: false,
      duration: duration,
    }).start(() => removeCard(false));
  };

  const onCorrectGuess = (dy = 0, duration = 400) => {
    Animated.timing(position, {
      toValue: { x: 1 * (SCREEN_WIDTH + 100), y: dy },
      useNativeDriver: false,
      duration: duration,
    }).start(() => removeCard(true));
  };

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
          direction < 0 ? onWrongGuess(dy, 200) : onCorrectGuess(dy, 200);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 4,
          }).start();
        }
      },
    })
  ).current;

  const frontView = (text: string) => {
    return (
      // @ts-expect-error package resolution warning
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [...rotateAndTranslate.transform, ...flipToFrontStyle.transform],
          ...styles.cardContainer,
          ...styles.backface,
          ...styles.front,
        }}
      >
        <Card text={text} isTopView={true} />
      </Animated.View>
    );
  };

  const backView = (text: string) => {
    return (
      // @ts-expect-error package resolution warning
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [...rotateAndTranslate.transform, ...flipToBackStyle.transform], ...styles.cardContainer, ...styles.back }}
      >
        <Card text={text} isTopView={false} />
      </Animated.View>
    );
  };

  const renderCards = useCallback(() => {
    return cards
      .map((item, i) => {
        if (i < currentCard.index) {
          return null;
        } else if (i === currentCard.index) {
          return (
            <View key={item.id}>
              {backView(item.value)}
              {frontView(item.key)}
            </View>
          );
        } else {
          return (
            // @ts-expect-error package resolution warning
            <Animated.View key={item.id} style={{ opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.cardContainer }}>
              <Card text={item.key} />
            </Animated.View>
          );
        }
      })
      .reverse();
  }, [currentCard.index]);

  return (
    // @ts-expect-error package resolution warning
    <Animated.View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      <NavigationBar title="" style={{ backgroundColor: theme.colors.transparent }} />
      {/* @ts-expect-error package resolution warning */}
      <Animated.View style={{ ...styles.wrongGuess, opacity: wrongGuessOpacity }}>
        <Text body1_bold style={{ color: theme.colors.white }}>
          Didn&apos;t get it right
        </Text>
      </Animated.View>
      {/* @ts-expect-error package resolution warning */}
      <Animated.View style={{ ...styles.correctGuess, opacity: correctGuessOpacity }}>
        <Text body1_bold style={{ color: theme.colors.white }}>
          I got it right
        </Text>
      </Animated.View>
      <View>{renderCards()}</View>
      <View style={styles.controlsContainer}>
        <Controls
          onPressCheck={() => onCorrectGuess()}
          onPressCross={() => onWrongGuess()}
          onPressRotate={() => {
            flipRotation ? flipToBack() : flipToFront();
          }}
        />
        <LinearProgress value={progress} variant="determinate" style={styles.progress} color={theme.colors.white} />
      </View>
    </Animated.View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  cardContainer: {
    height: toSize(400),
    left: 0,
    right: 0,
    marginTop: toSize(60),
    marginLeft: toSize(25),
    marginRight: toSize(25),
    padding: 10,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: theme.colors.white,
  },
  correctGuess: {
    position: 'absolute',
    top: toSize(80),
    left: SCREEN_WIDTH / 2 - 50,
  },
  wrongGuess: {
    position: 'absolute',
    top: toSize(80),
    left: SCREEN_WIDTH / 2 - 75,
  },
  progress: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
    height: toSize(7),
    backgroundColor: '#ADB0FF',
    borderRadius: 10,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: toSize(25),
    marginRight: toSize(25),
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: toSize(110),
  },
  back: {
    backgroundColor: '#EDEEFF',
  },
  front: {
    backgroundColor: theme.colors.white,
  },
  backface: {
    backfaceVisibility: 'hidden',
  },
}));

export default CardsScreen;
