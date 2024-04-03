import NavigationBar from '../../components/NavigationBar';
import { useCallback, useEffect, useRef, useState } from 'react';
import React, { View, Animated, PanResponder, StatusBar } from 'react-native';
import { Button, Dialog, LinearProgress, makeStyles, Text, useTheme } from '@rneui/themed';
import { SCREEN_HEIGHT, SCREEN_WIDTH, toSize } from '../../helpers/scaling';
import Card from '../../components/Card';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { STATUSBAR_HEIGHT } from '../../config';
import { _Card, _CardStatus, _Set, _User } from '../../models/dto';
import { NavProps } from '../../config/routes';
import { Cache } from '../../models/Cache';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import LocaleSwitch from '../../components/LocaleSwitch';
import { showToast } from '../../components/CustomToast';
import * as SystemNavigationBar from 'expo-navigation-bar';
import { Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import { getInitialStack, isValidUrl, log, reviewFlashcard } from '../../helpers/utility';
import Controls from './Controls';
import { FF_BOLD } from '../../theme/typography';

let scale = 0.5;
if (SCREEN_HEIGHT < 700) {
  scale = 0.6;  // small screens
} else if (SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 1000) {
  scale = 0.5;  // medium screens
} else {
  scale = 0.5;  // larger screens
}

const MARGIN_TOP = toSize(15);
const CARD_HEIGHT =  toSize(SCREEN_HEIGHT * scale);
const CONTROLS_MT = toSize(50);

type CardsScreenProps = {
  deckId: string;
  set: _Set;
  userId: string;
  user: _User;
};

const CardsScreen = ({ route, navigation }: NavProps) => {
  const { set, deckId, user }: CardsScreenProps = route.params!;

  const [cards, setCards] = useState<_Card[]>([]);
  const [currentCard, setCurrentCard] = useState({ index: 0, isCorrect: false });
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [localeSwitch, setLocalSwtich] = useState<boolean>(false);
  let [cardStatuses, setCardStatuses] = useState<Record<string, _CardStatus>>(set.cardStatuses);

  // animation
  const confettiRef = useRef<LottieView>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;
  let flipRotation = 0;
  flipAnimation.addListener(({ value }) => (flipRotation = value));

  // audio
  const [sound, setSound] = useState<Sound | null>();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // alerts
  const [resetAlert, setResetAlert] = useState(false);

  // styles
  const styles = useStyles();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // audio
  useEffect(() => {
    console.log(SCREEN_HEIGHT);
    
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // initialize cards and set navigation bar color
  useEffect(() => {
    console.log('using', user.preferences.usingSm2);

    if (user.preferences.usingSm2) {
      const cardsForToday = getInitialStack(set.cards, cardStatuses);
      setCards(cardsForToday);

      if (cardsForToday.length === 0) {
        setIsSessionComplete(true);
        fadeIn();
        confettiRef.current?.play();
      }
    } else {
      setCards(set.cards);
    }

    setLoading(false);
    SystemNavigationBar.setBackgroundColorAsync(theme.colors.cardsBackground!);

    return () => {
      // on destroy
      SystemNavigationBar.setBackgroundColorAsync(theme.colors.background);
    };
  }, []);

  // on card swiped
  useEffect(() => {
    if (currentCard.index === 0) return;
    setProgress(currentCard.index / cards.length);

    if (user.preferences.usingSm2) {
      const cardId = cards[currentCard.index - 1].id;
      reviewFlashcard(cardStatuses[cardId], currentCard.isCorrect ? 4.5 : 2.5);

      // save the card status
      setCardStatuses((prev) => {
        const updatedStatus = { ...prev, [cardId]: prev[cardId] };
        Cache.getInstance().saveCardStatuses(deckId, set.id, updatedStatus);

        return updatedStatus;
      });
    } else if (currentCard.index === cards.length) {
      setIsSessionComplete(true);
      fadeIn();
    }
  }, [currentCard]);

  // session listener
  useEffect(() => {
    if (isSessionComplete) {
      confettiRef.current?.play();
    }
  }, [isSessionComplete]);

  const playSound = async (path: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: path });
      setSound(sound);

      await sound.playAsync();
      setIsAudioPlaying(false);
    } catch (error: any) {
      log(error.message);
      showToast(t('screens.cards.no_audio'), 'error');
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

  const onAudioPlayClick = () => {
    if (isAudioPlaying) {
      return;
    }

    const audio = cards[currentCard.index].audio;
    playSound(audio!);
    setIsAudioPlaying(true);
  };

  const onRotateClick = () => {
    flipRotation ? flipToBack() : flipToFront();
  };

  const onResetPress = async () => {
    await Cache.getInstance().resetCardStatuses(deckId, set.id);
    showToast(t('screens.cards.reset_done'));
    setResetAlert(false);

    // setCards(getInitialStack(set.cards, cardStatuses));
    // setCurrentCard({ index: 0, isCorrect: false });
    // setProgress(0);
    // setIsSessionComplete(false);
    // confettiRef.current?.pause();
    navigation.pop();
  };

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
        <Card text={text} isTopView={true} isCompleted={user.preferences.usingSm2 ? isCompleted : false} example={example} type={type} />
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
        <Card text={text} isTopView={false} isCompleted={user.preferences.usingSm2 ? isCompleted : false} example={example} />
      </Animated.View>
    );
  };

  const renderCards = useCallback(() => {
    if (currentCard.index >= cards.length) {
      return null;
    }

    const isCompleted = cardStatuses[cards[currentCard.index].id].isCompleted;
    const firstCard = cards[currentCard.index];
    const secondCard = currentCard.index + 1 >= cards.length ? null : cards[currentCard.index + 1];

    return (
      <>
        {secondCard && (
          /* @ts-expect-error package resolution warning */
          <Animated.View key={secondCard.id} style={{ opacity: nextCardOpacity, transform: [{ scale: nextCardScale }], ...styles.cardContainer }}>
            <Card text={secondCard.front} isCompleted={user.preferences.usingSm2 ? isCompleted : false} type={secondCard.type} />
          </Animated.View>
        )}
        <View>
          {backView(localeSwitch ? firstCard.back2 : firstCard.back, isCompleted, firstCard.example)}
          {frontView(firstCard.front, isCompleted, firstCard.example, firstCard.type)}
        </View>
      </>
    );
  }, [currentCard.index, loading, localeSwitch]);

  return (
    // @ts-expect-error package resolution warning
    <Animated.View style={{ ...styles.container, backgroundColor: backgroundColor }}>
      <StatusBar backgroundColor={theme.colors.cardsBackground} />
      <NavigationBar
        title=""
        style={{ backgroundColor: theme.colors.transparent }}
        optionsMenu={
          <Button
            type="clear"
            buttonStyle={styles.optionsIconBtn}
            containerStyle={{
              borderRadius: 30,
            }}
            onPress={() => setResetAlert(true)}
          >
            <MaterialCommunityIcons name="refresh" style={styles.optionsIcon} size={toSize(23)} />
          </Button>
        }
      />
      {/* shuffle button */}
      {/* {cards.length > 0 && (
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
      )} */}

      {isSessionComplete && (
        <>
          <LottieView ref={confettiRef} loop={false} source={require('../../assets/animation/confetti-animation.json')} style={styles.confetti} />
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
                  {user.preferences.usingSm2 ? t('screens.cards.completed.subtitle') : t('screens.cards.completed.subtitle_no_sm2')}
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
            onPressRotate={onRotateClick}
            onPlayAudio={onAudioPlayClick}
            hasAudio={isValidUrl(cards[currentCard.index].audio)}
            isAudioPlaying={isAudioPlaying}
          />

          <View style={styles.switchProgressContainer}>
            {cards[currentCard.index].back2.length > 0 && (
              <LocaleSwitch
                value={true}
                onValueChange={(value: boolean) => {
                  setLocalSwtich(!value);
                }}
                mb={theme.spacing.lg}
                value1={t('screens.cards.switch1')}
                value2={t('screens.cards.switch2')}
              />
            )}
            <LinearProgress value={progress} variant="determinate" style={styles.progress} color={theme.colors.white} />
          </View>
        </View>
      )}
      <Dialog isVisible={resetAlert} onBackdropPress={() => setResetAlert(!resetAlert)}>
        <Text style={styles.alertTitle}>{t('screens.cards.alert.title')}</Text>
        <Text body1>{t('screens.cards.alert.subtitle')}</Text>
        <Dialog.Actions>
          <Dialog.Button title={t('screens.settings.alert.dialog_confirm')} titleStyle={styles.alertActionButtonPos} onPress={onResetPress} />
          <Dialog.Button
            title={t('screens.settings.alert.dialog_cancel')}
            titleStyle={styles.alertTitle}
            onPress={() => setResetAlert(!resetAlert)}
          />
        </Dialog.Actions>
      </Dialog>
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
    height: CARD_HEIGHT,
    left: 0,
    right: 0,
    marginTop: toSize(50 - MARGIN_TOP),
    marginLeft: toSize(25),
    marginRight: toSize(25),
    padding: 10,
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: theme.colors.white,
  },
  correctGuess: {
    position: 'absolute',
    top: toSize(60 - MARGIN_TOP),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  wrongGuess: {
    position: 'absolute',
    top: toSize(60 - MARGIN_TOP),
    left: 0,
    right: 0,
    alignItems: 'center',
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
  alertTitle: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
  },
  alertActionButtonPos: {
    fontFamily: FF_BOLD,
    paddingBottom: 5,
    color: theme.colors.orange,
  },
  controlsContainer: {
    flex: 1,
    marginLeft: toSize(25),
    marginRight: toSize(25),
    marginTop: CARD_HEIGHT + CONTROLS_MT,
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
  optionsIcon: {
    color: theme.mode === 'dark' ? theme.colors.white : theme.colors.orange,
  },
  optionsIconBtn: {
    padding: 0,
    paddingHorizontal: 0,
  },
}));

export default CardsScreen;
