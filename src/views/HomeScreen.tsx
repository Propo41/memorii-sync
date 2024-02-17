import { useFocusEffect } from '@react-navigation/native';
import { Avatar, Image, Text, makeStyles, useTheme, useThemeMode } from '@rneui/themed';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StatusBar, View } from 'react-native';
import Deck from '../components/Deck';
import TitleBar from '../components/TitleBar';
import { iconSize } from '../config';
import { NavProps, NavRoutes } from '../config/routes';
import { toSize } from '../helpers/scaling';
import { Cache } from '../models/Cache';
import { _Deck, _User } from '../models/dto';
import { FirebaseApp } from '../models/FirebaseApp';
import auth from '@react-native-firebase/auth';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import * as NavigationBar from 'expo-navigation-bar';
import { kickUser } from '../helpers/utility';

const fetchAndSaveDeck = async (deckId: string) => {
  const deck = await FirebaseApp.getInstance().getDeck(deckId);
  if (deck) {
    await Cache.getInstance().saveDeck(deckId, deck);
    return deck;
  }

  return null;
};

const getCompletionCount = async (userId: string, deckId: string) => {
  return await FirebaseApp.getInstance().getDeckStatus(userId, deckId);
};

const calculateDeckProgress = async (userId: string, decksList: _Deck[]) => {
  for (const deck of decksList) {
    const total = deck.sets.reduce((acc, set) => acc + (set.cards?.length || 0), 0);
    const completed = await getCompletionCount(userId, deck!.id!);
    const progress = completed / total;
    deck._progress = progress;
  }
};

export default function HomeScreen({ navigation }: NavProps) {
  const styles = useStyles();
  const { theme } = useTheme();
  const [decks, setDecks] = useState<_Deck[]>([]);
  const [user, setUser] = useState<_User>();
  const [loading, setLoading] = useState(false);
  const animationRef = useRef<LottieView>(null);
  // app state
  const { setMode } = useThemeMode();
  const [_, setLanguage] = useState<string>('English');
  const { t, i18n } = useTranslation(); // i18n instance
  const [isEmpty, setIsEmpty] = useState(false);

  const setUserPreference = async (user: _User) => {
    const { locale, isDarkMode } = user.preferences;
    setLanguage(locale);
    i18n.changeLanguage(locale);

    setMode(isDarkMode ? 'dark' : 'light');
    await NavigationBar.setBackgroundColorAsync(isDarkMode ? theme.colors.violetShade! : theme.colors.white);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchDecks = async (user: _User) => {
        const decksList: _Deck[] = [];

        if (user.decksPurchased) {
          for (const deckId of user.decksPurchased) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        if (user.decksCreated) {
          for (const deckId of user.decksCreated) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        await calculateDeckProgress(user.id, decksList);
        setDecks(decksList);
        animationRef.current?.pause();

        return decksList;
      };

      const currentUser = auth().currentUser;
      if (!currentUser) {
        kickUser(navigation, t);
        return;
      }

      FirebaseApp.getInstance()
        .getUser(currentUser.uid)
        .then(async (user) => {
          if (!user) {
            await kickUser(navigation, t);
            return;
          }

          const loadingTimer = setTimeout(() => {
            setLoading(true);
            animationRef.current?.play();
          }, 500);

          setUser(user);
          setUserPreference(user);

          const res = await fetchDecks(user);
          await calculateDeckProgress(user.id, decks);

          if (res.length === 0) {
            setIsEmpty(true);
          }

          clearTimeout(loadingTimer);
          setLoading(false);
        });
    }, [])
  );

  return (
    <View>
      <StatusBar backgroundColor={theme.colors.background} hidden={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar
          title={t('screens.home.title')}
          subtitle={t('screens.home.subtitle')}
          icon={<Avatar size={iconSize.lg} rounded source={{ uri: user?.profilePicture }} containerStyle={styles.avatar} />}
        />
        {isEmpty && (
          <View style={styles.notFoundContainer}>
            <Image source={require('../assets/not-found.png')} style={styles.notFoundImage} />
            <Text body1 style={styles.notFoundText}>
              No decks yet. Buy one from the market or create one yourself!
            </Text>
          </View>
        )}
        {!loading && (
          <>
            <View style={{ marginTop: theme.spacing.lg }}>
              {decks.map((deck, index) => {
                const { bgColor, fgColor, trackColor, textColor } = deck.appearance;

                return (
                  <Deck
                    key={index}
                    name={deck.name}
                    progress={deck._progress || 0}
                    mt={index > 0 ? 8 : 0}
                    mb={index === decks.length - 1 ? 70 : 0}
                    containerBgColor={bgColor}
                    pbColor={fgColor}
                    pbBackgroundColor={trackColor!}
                    textColor={textColor}
                    onDeckPress={() => {
                      // @ts-expect-error cant fix this ts error
                      navigation.push(NavRoutes.Sets, {
                        deckId: deck.id,
                      });
                    }}
                  />
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      {loading && <LottieView ref={animationRef} loop={true} source={require('../assets/animation/loading-animation.json')} style={styles.loading} />}
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    marginVertical: toSize(15),
  },
  notFoundContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loading: {
    width: '70%',
    height: '50%',
    alignSelf: 'center',
    marginBottom: 200,
  },
  notFoundImage: {
    width: toSize(150),
    height: toSize(150),
  },
  notFoundText: {
    textAlign: 'center',
    color: theme.colors.text,
    paddingHorizontal: 30,
    marginTop: 10,
  },
}));
