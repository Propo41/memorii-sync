import NavigationBar from '../components/NavigationBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import React, { View, Animated, PanResponder, StatusBar, AppState } from 'react-native';
import { FAB, LinearProgress, makeStyles, Text, useTheme } from '@rneui/themed';
import { SCREEN_WIDTH, toSize } from '../helpers/scaling';
import Card from '../components/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { iconSize } from '../config';
import { _Card } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';
import { NavProps } from '../config/routes';
import { Cache } from '../models/Cache';
import LottieView from 'lottie-react-native';

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

type CardsScreenProps = {
  cards: _Card[];
  deckId: string;
  setId: string;
};

const userId = `SDBk0R01TxrTHF839qoL`;

const CardsScreen = ({ route }: NavProps) => {
  const [currentCard, setCurrentCard] = useState({ index: 0, isCorrect: false });
  const [progress, setProgress] = useState(0);
  const [cardStatuses, setCardStatuses] = useState<Record<number, boolean>>({});
  const position = useRef(new Animated.ValueXY()).current;
  const styles = useStyles();
  const { theme } = useTheme();
  const { cards, deckId, setId }: CardsScreenProps = route.params!;
  const [appState, setAppState] = useState<string>(AppState.currentState);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<LottieView>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const saveCardStatuses = () => {
    Cache.getInstance()
      .getCardStatuses(userId, deckId, setId)
      .then(async (statuses) => {
        if (statuses !== null) {
          await FirebaseApp.getInstance().updateCardStatuses(userId, deckId, setId, statuses);
        }
      });
  };

  const onPause = (nextAppState: string) => {
    if (appState === 'active' && nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background!');
      saveCardStatuses();
    }
    setAppState(nextAppState);
  };

  useEffect(() => {
    // on create
    const subscriptionInactive = AppState.addEventListener('change', onPause);
    const subscriptionMemoryWarning = AppState.addEventListener('memoryWarning', onPause);

    return () => {
      // on destroy
      saveCardStatuses();

      // @ts-expect-error remove() does exit
      subscriptionInactive.remove();
      // @ts-expect-error remove() does exit
      subscriptionMemoryWarning.remove();
    };
  }, []);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => (flipRotation = value));

  useEffect(() => {
    const fetchData = async () => {
      const cardStatuses = await FirebaseApp.getInstance().getCardStatuses(userId, deckId, setId);
      if (cardStatuses) {
        setCardStatuses(cardStatuses);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentCard.index === 0) return;
    setProgress(currentCard.index / cards.length);
    setCardStatuses((prev) => {
      const statuses = { ...prev, [cards[currentCard.index - 1].id]: currentCard.isCorrect };
      Cache.getInstance().saveCardStatuses(userId, deckId, setId, statuses);
      return statuses;
    });
    console.log('(currentCard.index', currentCard.index);
    if (currentCard.index === cards.length) {
      setIsCompleted(true);
      fadeIn();
    }
  }, [currentCard]);

  useEffect(() => {
    if (isCompleted) {
      animationRef.current?.play();
    }
  }, [isCompleted]);

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

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
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

  const frontView = (text: string, isCompleted: boolean) => {
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
        <Card text={text} isTopView={true} isCompleted={isCompleted} />
      </Animated.View>
    );
  };

  const backView = (text: string, isCompleted: boolean) => {
    return (
      // @ts-expect-error package resolution warning
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [...rotateAndTranslate.transform, ...flipToBackStyle.transform], ...styles.cardContainer, ...styles.back }}
      >
        <Card text={text} isTopView={false} isCompleted={isCompleted} />
      </Animated.View>
    );
  };

  const renderCards = useCallback(() => {
    if (currentCard.index >= cards.length) {
      return null;
    }

    const isCompleted = !!cardStatuses[cards[currentCard.index].id];
    const firstCard = cards[currentCard.index];
    const secondCard = currentCard.index + 1 >= cards.length ? null : cards[currentCard.index + 1];

    console.log('firstCard');

    return (
      <>
        {secondCard && (
          /* @ts-expect-error package resolution warning */
          <Animated.View key={secondCard.id} style={{ opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.cardContainer }}>
            <Card text={secondCard.front} isCompleted={isCompleted} />
          </Animated.View>
        )}
        <View>
          {backView(firstCard.back, isCompleted)}
          {frontView(firstCard.front, isCompleted)}
        </View>
      </>
    );
  }, [currentCard.index, loading]);

  return (
    // @ts-expect-error package resolution warning
    <Animated.View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      <StatusBar backgroundColor={theme.colors.cardsBackground} />
      <NavigationBar title="" style={{ backgroundColor: theme.colors.transparent }} />
      {isCompleted && (
        <>
          <LottieView ref={animationRef} loop={false} source={require('../assets/confettin-animation.json')} style={styles.confetti} />
          {/* @ts-expect-error package resolution warning */}
          <Animated.View
            style={{
              opacity: fadeAnim,
            }}
          >
            <View style={styles.completionCardContainer}>
              <View style={styles.completionCard}>
                <Text body1_bold>Congratulations!</Text>
                <Text body2 style={styles.pt}>
                  Keep it up
                </Text>
              </View>
            </View>
          </Animated.View>
        </>
      )}
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
      {currentCard.index < cards.length && (
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
      )}
    </Animated.View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  confetti: {
    width: '100%',
    height: '70%',
    position: 'absolute',
    marginTop: 100,
    zIndex: 1000,
  },
  pt: {
    paddingTop: 10,
  },
  completionCardContainer: {
    marginTop: '50%',
  },
  completionCard: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
    paddingTop: 30,
    paddingBottom: 30,
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
    borderRadius: 10,
    backgroundColor: theme.colors.white,
  },
  correctGuess: {
    position: 'absolute',
    top: toSize(70),
    left: SCREEN_WIDTH / 2 - 50,
  },
  wrongGuess: {
    position: 'absolute',
    top: toSize(70),
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
