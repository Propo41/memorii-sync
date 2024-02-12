import NavigationBar from '../components/NavigationBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import React, { View, Animated, PanResponder, StatusBar, AppState } from 'react-native';
import { Button, FAB, LinearProgress, makeStyles, Text, useTheme } from '@rneui/themed';
import { SCREEN_HEIGHT, SCREEN_WIDTH, toSize } from '../helpers/scaling';
import Card from '../components/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { LANGUAGE_CODE, STATUSBAR_HEIGHT, iconSize } from '../config';
import { _Card } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';
import { NavProps } from '../config/routes';
import { Cache } from '../models/Cache';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import LocaleSwitch from '../components/LocaleSwitch';
import { showToast } from '../components/CustomToast';
import * as SystemNavigationBar from 'expo-navigation-bar';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { log } from '../helpers/utility';

type ControlsProps = {
  onPressCross: () => void;
  onPressRotate: () => void;
  onPressCheck: () => void;
  onPlayAudio: () => void;
};

const MARGIN_TOP = 10;

const Controls = ({ onPressCross, onPressRotate, onPressCheck, onPlayAudio }: ControlsProps) => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.controls}>
      <FAB size="large" color="white" icon={<EntypoIcons name="cross" color="#FF3636" size={iconSize.sm} />} onPress={onPressCross} />
      <FAB
        size="large"
        icon={<EntypoIcons name="sound" color={theme.colors.white} size={iconSize.sm} />}
        color={theme.mode === 'dark' ? theme.colors.purple : theme.colors.orange}
        style={{ marginLeft: theme.spacing.lg }}
        onPress={onPlayAudio}
      />
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
  userId: string;
  localesSupported: string[];
};

const CardsScreen = ({ route }: NavProps) => {
  const { cards, deckId, setId, userId, localesSupported }: CardsScreenProps = route.params!;

  const [currentCard, setCurrentCard] = useState({ index: 0, isCorrect: false });
  const [progress, setProgress] = useState(0);
  const [cardStatuses, setCardStatuses] = useState<Record<number, boolean>>({});
  const styles = useStyles();
  const { theme } = useTheme();
  const [appState, setAppState] = useState<string>(AppState.currentState);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const { t } = useTranslation();
  const [localeSwitch, setLocalSwtich] = useState<boolean>(false);
  // animation
  const animationRef = useRef<LottieView>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => (flipRotation = value));

  // audio
  const [sound, setSound] = useState<Sound>();

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
      SystemNavigationBar.setBackgroundColorAsync(theme.colors.background);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const cardStatuses = await FirebaseApp.getInstance().getCardStatuses(userId, deckId, setId);
      if (cardStatuses) {
        setCardStatuses(cardStatuses);
      }
      setLoading(false);
    };

    fetchData();
    SystemNavigationBar.setBackgroundColorAsync(theme.colors.cardsBackground!);
  }, []);

  useEffect(() => {
    if (currentCard.index === 0) return;
    setProgress(currentCard.index / cards.length);
    setCardStatuses((prev) => {
      const statuses = { ...prev, [cards[currentCard.index - 1].id]: currentCard.isCorrect };
      Cache.getInstance().saveCardStatuses(userId, deckId, setId, statuses);
      return statuses;
    });

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

  const playSound = async (path: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: path });
      setSound(sound);
      log('Playing sound');

      await sound.playAsync();
    } catch (error: any) {
      log(error.message);
      showToast("Couldn't play the audio. Network issue?", 'error');
    }
  };

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
      saveCardStatuses();
    }
    setAppState(nextAppState);
  };

  function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

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

  const frontView = (text: string, isCompleted: boolean, example?: string, type?: string) => {
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
        <Card text={text} isTopView={true} isCompleted={isCompleted} example={example} type={type} />
      </Animated.View>
    );
  };

  const backView = (text: string, isCompleted: boolean, example: string | null = null) => {
    return (
      // @ts-expect-error package resolution warning
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [...rotateAndTranslate.transform, ...flipToBackStyle.transform], ...styles.cardContainer, ...styles.back }}
      >
        <Card text={text} isTopView={false} isCompleted={isCompleted} example={example} />
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

    return (
      <>
        {secondCard && (
          /* @ts-expect-error package resolution warning */
          <Animated.View key={secondCard.id} style={{ opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.cardContainer }}>
            <Card text={secondCard.front} isCompleted={isCompleted} type={secondCard.type} />
          </Animated.View>
        )}
        <View>
          {backView(localeSwitch ? firstCard.backLocale : firstCard.back, isCompleted, firstCard.example)}
          {frontView(firstCard.front, isCompleted, firstCard.example, firstCard.type)}
        </View>
      </>
    );
  }, [currentCard.index, loading, localeSwitch]);

  return (
    // @ts-expect-error package resolution warning
    <Animated.View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      <StatusBar backgroundColor={theme.colors.cardsBackground} />
      <NavigationBar title="" style={{ backgroundColor: theme.colors.transparent }} />
      <View style={styles.shuffleButtonContainer}>
        <Button
          radius={'xs'}
          size={'lg'}
          type="solid"
          onPress={() => {
            shuffleCards();
            showToast(t('screens.cards.shuffle'));
            setCurrentCard({ index: 0, isCorrect: false });
          }}
          buttonStyle={styles.shuffleButton}
        >
          <MaterialCommunityIcons name="shuffle" color={theme.colors.white} size={iconSize.sm} />
        </Button>
      </View>
      {isCompleted && (
        <>
          <LottieView ref={animationRef} loop={false} source={require('../assets/animation/confetti-animation.json')} style={styles.confetti} />
          {/* @ts-expect-error package resolution warning */}
          <Animated.View
            style={{
              opacity: fadeAnim,
            }}
          >
            <View style={styles.completionCardContainer}>
              <View style={styles.completionCard}>
                <Text body1_bold>{t('screens.cards.completed.title')}</Text>
                <Text body2 style={styles.pt}>
                  {t('screens.cards.completed.subtitle')}
                </Text>
              </View>
            </View>
          </Animated.View>
        </>
      )}
      {/* @ts-expect-error package resolution warning */}
      <Animated.View style={{ ...styles.wrongGuess, opacity: wrongGuessOpacity }}>
        <Text body1_bold style={{ color: theme.colors.white }}>
          {t('screens.cards.incorrectGuess')}
        </Text>
      </Animated.View>
      {/* @ts-expect-error package resolution warning */}
      <Animated.View style={{ ...styles.correctGuess, opacity: correctGuessOpacity }}>
        <Text body1_bold style={{ color: theme.colors.white }}>
          {t('screens.cards.correctGuess')}
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
            onPlayAudio={() => {
              const audio = cards[currentCard.index].audio;
              if (audio) {
                playSound(audio);
              } else {
                showToast('No pronounciation exists for this card.', 'error');
              }
            }}
          />

          <View style={styles.switchProgressContainer}>
            {localesSupported.length >= 2 && (
              <LocaleSwitch
                value={true}
                onValueChange={(value: boolean) => {
                  setLocalSwtich(!value);
                }}
                mb={theme.spacing.lg}
                value1={LANGUAGE_CODE[localesSupported[0]]}
                value2={LANGUAGE_CODE[localesSupported[1]]}
              />
            )}
            <LinearProgress value={progress} variant="determinate" style={styles.progress} color={theme.colors.white} />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
  },
  shuffleButtonContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginBottom: toSize((SCREEN_HEIGHT - (460 + STATUSBAR_HEIGHT + 80)) / 4 - MARGIN_TOP),
  },
  shuffleButton: {
    backgroundColor: theme.mode === 'dark' ? '#744FA3' : '#5B61FF',
    borderRadius: 0,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
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
    marginTop: toSize(60 - MARGIN_TOP),
    marginLeft: toSize(25),
    marginRight: toSize(25),
    padding: 10,
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: theme.colors.white,
  },
  correctGuess: {
    position: 'absolute',
    top: toSize(70 - MARGIN_TOP),
    left: SCREEN_WIDTH / 2 - 50,
  },
  wrongGuess: {
    position: 'absolute',
    top: toSize(70 - MARGIN_TOP),
    left: SCREEN_WIDTH / 2 - 75,
  },
  switchProgressContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  progress: {
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
    marginBottom: toSize((SCREEN_HEIGHT - (460 + STATUSBAR_HEIGHT + 80) + MARGIN_TOP) / 2),
  },
  back: {
    backgroundColor: '#FDFFB4',
  },
  front: {
    backgroundColor: theme.colors.white,
  },
  backface: {
    backfaceVisibility: 'hidden',
  },
}));

export default CardsScreen;
