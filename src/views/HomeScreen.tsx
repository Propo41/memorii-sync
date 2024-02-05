import { useFocusEffect } from '@react-navigation/native';
import { Avatar, makeStyles, useTheme, useThemeMode } from '@rneui/themed';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { showToast } from '../components/CustomToast';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation(); //i18n instance

  // fetch user
  useEffect(() => {
    const getData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const user = await FirebaseApp.getInstance().getUser(currentUser!.uid);
      if (!user) return;

      const { locale, isDarkMode } = user.preferences;
      setLanguage(locale);
      i18n.changeLanguage(locale);

      setMode(isDarkMode ? 'dark' : 'light');
    };

    getData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadingTimer = setTimeout(() => {
        setLoading(true);
        animationRef.current?.play();
      }, 500);

      const fetchData = async (id: string) => {
        const user = await FirebaseApp.getInstance().getUser(id);
        if (!user) {
          showToast(t('screens.toast.sessionExpired'), 'error');
          await auth().signOut();
          await GoogleSignin.revokeAccess();
          navigation.replace(NavRoutes.Login);

          return;
        }

        setUser(user);
        const decksList: _Deck[] = [];

        if (user?.decksPurchased) {
          for (const deckId of user.decksPurchased) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        if (user?.decksCreated) {
          for (const deckId of user.decksCreated) {
            const deck = await fetchAndSaveDeck(deckId);
            if (deck) {
              deck.id = deckId;
              decksList.push(deck);
            }
          }
        }

        await calculateDeckProgress(id, decksList);
        setDecks(decksList);
        setLoading(false);
        clearTimeout(loadingTimer);
        animationRef.current?.pause();
      };

      const user = auth().currentUser;
      fetchData(user!.uid);
    }, [])
  );

  return (
    <View>
      <StatusBar backgroundColor={theme.colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <TitleBar
          title={t('screens.home.title')}
          subtitle={t('screens.home.subtitle')}
          icon={<Avatar size={iconSize.lg} rounded source={{ uri: user?.profilePicture }} containerStyle={styles.avatar} />}
        />
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
      {loading && <LottieView ref={animationRef} loop={true} source={require('../assets/loading-animation.json')} style={styles.loading} />}
    </View>
  );
}

const useStyles = makeStyles(() => ({
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
    width: toSize(197),
    height: toSize(192),
  },
}));
